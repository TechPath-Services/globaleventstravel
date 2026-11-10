"""New uploads use a readable name, do not replace existing blobs, and set content type.

Public containers get a permanent blob URL with no SAS. Private containers still
get a SAS URL. URLs already stored on media rows are not rewritten here.
"""

import re
from types import SimpleNamespace

from app.services.storage import (
    AzureStorage,
    StorageBackend,
    choose_unique_storage_path,
    resolve_content_type,
)


def test_generate_filename_uses_readable_slug_and_timestamp():
    name = StorageBackend.generate_filename("Friendship Peak Itinerary.pdf", "deadbeef" * 8)
    assert re.fullmatch(r"Friendship-Peak-Itinerary_\d{8}_\d{6}\.pdf", name)
    assert "deadbeef" not in name

    traversed = StorageBackend.generate_filename(r"..\..\Kedarkantha-Trek-5D4N.PDF", "abc")
    assert "/" not in traversed and "\\" not in traversed
    assert re.fullmatch(r"Kedarkantha-Trek-5D4N_\d{8}_\d{6}\.pdf", traversed)

    fallback = StorageBackend.generate_filename("???", "abc")
    assert re.fullmatch(r"file_\d{8}_\d{6}", fallback)


def test_resolve_content_type_for_pdf_and_images():
    assert resolve_content_type("notes.PDF") == "application/pdf"
    assert resolve_content_type("notes.pdf", "application/octet-stream") == "application/pdf"
    assert resolve_content_type("photo.jpg") == "image/jpeg"
    assert resolve_content_type("photo.jpeg") == "image/jpeg"
    assert resolve_content_type("photo.PNG", "image/png") == "image/png"
    assert resolve_content_type("photo.gif") == "image/gif"
    assert resolve_content_type("photo.webp") == "image/webp"
    assert resolve_content_type("icon.svg") == "image/svg+xml"
    assert resolve_content_type("clip.mp4") == "video/mp4"
    assert resolve_content_type("unknown.bin") == "application/octet-stream"


def test_choose_unique_storage_path_never_reuses_an_existing_name():
    taken = {"itineraries/Kedarkantha-Trek-5D4N.pdf"}
    first = choose_unique_storage_path(
        "itineraries",
        "Friendship-Peak.pdf",
        taken.__contains__,
    )
    assert first == "itineraries/Friendship-Peak.pdf"

    taken.add("itineraries/Kedarkantha-Trek-5D4N.pdf")
    second = choose_unique_storage_path(
        "itineraries",
        "Kedarkantha-Trek-5D4N.pdf",
        taken.__contains__,
    )
    assert second == "itineraries/Kedarkantha-Trek-5D4N-2.pdf"


class _FakeBlob:
    def __init__(self, name: str, url: str):
        self.name = name
        self.url = url
        self.content = None
        self.content_settings = None
        self.overwrite = None

    def exists(self) -> bool:
        return self.content is not None

    def upload_blob(self, content, overwrite=False, content_settings=None):
        if self.content is not None and not overwrite:
            error = Exception("BlobAlreadyExists")
            error.error_code = "BlobAlreadyExists"
            raise error
        self.content = content
        self.content_settings = content_settings
        self.overwrite = overwrite


class _FakeContainer:
    def __init__(self, public_access):
        self.public_access = public_access
        self.blobs = {}

    def get_blob_client(self, name: str) -> _FakeBlob:
        if name not in self.blobs:
            url = "https://techpath.blob.core.windows.net/" f"global-events-travels/{name}"
            self.blobs[name] = _FakeBlob(name, url)
        return self.blobs[name]

    def get_container_properties(self):
        return SimpleNamespace(public_access=self.public_access)


def _storage(container: _FakeContainer) -> AzureStorage:
    storage = AzureStorage()
    storage.connection_string = "AccountName=techpath;AccountKey=secret;"
    storage.container_name = "global-events-travels"
    storage._container_client = container
    storage._client = object()
    return storage


async def test_public_container_upload_returns_plain_url_and_pdf_type():
    container = _FakeContainer("blob")
    storage = _storage(container)
    path = await storage.upload(
        b"%PDF",
        "Friendship-Peak_20261110_194500.pdf",
        "itineraries",
        content_type="application/octet-stream",
    )
    url = storage.get_url(path)

    assert path == "itineraries/Friendship-Peak_20261110_194500.pdf"
    assert url == (
        "https://techpath.blob.core.windows.net/global-events-travels/"
        "itineraries/Friendship-Peak_20261110_194500.pdf"
    )
    assert "sig=" not in url and "se=" not in url
    blob = container.blobs[path]
    assert blob.overwrite is False
    assert blob.content_settings.content_type == "application/pdf"


async def test_upload_does_not_overwrite_an_existing_blob():
    container = _FakeContainer("container")
    storage = _storage(container)
    filename = "Kedarkantha-Trek-5D4N_20261110_010000.pdf"
    first = await storage.upload(b"original", filename, "itineraries", "application/pdf")
    second = await storage.upload(b"new-bytes", filename, "itineraries", "application/pdf")

    assert first == f"itineraries/{filename}"
    assert second == "itineraries/Kedarkantha-Trek-5D4N_20261110_010000-2.pdf"
    assert container.blobs[first].content == b"original"
    assert container.blobs[second].content == b"new-bytes"
    assert "?" not in storage.get_url(second)


async def test_private_container_keeps_sas_url_and_image_content_type(monkeypatch):
    container = _FakeContainer(None)
    storage = _storage(container)
    monkeypatch.setattr(AzureStorage, "_sas_token", lambda self, path: "sp=r&sig=test")

    path = await storage.upload(b"img", "summit.png", "expeditions", content_type="image/png")
    url = storage.get_url(path)

    assert url == (
        "https://techpath.blob.core.windows.net/global-events-travels/" f"{path}?sp=r&sig=test"
    )
    assert container.blobs[path].content_settings.content_type == "image/png"
