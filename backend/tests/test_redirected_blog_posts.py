"""Thin Kedarkantha deal posts stay in the database and leave public lists."""

from app.db.models.blog import BlogAuthor, BlogPost

DEAL_SLUG = "unbelievable-kedarkantha-trek-deals-you-cant-resist"
GUIDE_SLUG = "best-time-to-trek-kedarkantha"


def _seed_posts(db):
    author = BlogAuthor(name="Guide")
    db.add(author)
    db.commit()
    db.refresh(author)
    for slug, featured in ((DEAL_SLUG, True), (GUIDE_SLUG, True)):
        db.add(
            BlogPost(
                title=slug.replace("-", " "),
                slug=slug,
                content="<p>Kedarkantha notes</p>",
                status="published",
                author_id=author.id,
                featured=featured,
                category="guides",
                content_type="html",
            )
        )
    db.commit()


def test_public_blog_lists_omit_redirected_deal_posts(client, db):
    _seed_posts(db)

    hidden = client.get(
        "/api/v1/blog/posts",
        params={"status": "published", "hide_redirected": "true", "search": "kedarkantha"},
    )
    assert hidden.status_code == 200
    hidden_body = hidden.json()
    hidden_slugs = [item["slug"] for item in hidden_body["items"]]
    assert DEAL_SLUG not in hidden_slugs
    assert GUIDE_SLUG in hidden_slugs
    assert hidden_body["total"] == 1

    visible = client.get("/api/v1/blog/posts", params={"status": "published"})
    visible_slugs = [item["slug"] for item in visible.json()["items"]]
    assert DEAL_SLUG in visible_slugs
    assert visible.json()["total"] == 2

    featured = client.get("/api/v1/blog/posts/featured")
    assert featured.status_code == 200
    featured_slugs = [item["slug"] for item in featured.json()]
    assert DEAL_SLUG not in featured_slugs
    assert GUIDE_SLUG in featured_slugs

    recent = client.get("/api/v1/blog/posts/recent")
    recent_slugs = [item["slug"] for item in recent.json()]
    assert DEAL_SLUG not in recent_slugs
    assert GUIDE_SLUG in recent_slugs

    related = client.get(f"/api/v1/blog/posts/{GUIDE_SLUG}/related")
    assert related.status_code == 200
    assert DEAL_SLUG not in [item["slug"] for item in related.json()]

    direct = client.get(f"/api/v1/blog/posts/{DEAL_SLUG}")
    assert direct.status_code == 200
    assert direct.json()["slug"] == DEAL_SLUG
