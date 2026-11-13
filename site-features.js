/* Editorial layout refinements for the story and contact pages. */
.story-content::after,
.contact-content::after { content: none !important; display: none !important; }

.story-hero,
.contact-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #171717;
}
.story-hero::after,
.contact-hero::after {
  position: absolute;
  z-index: -1;
  inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,.78), rgba(0,0,0,.28) 72%), linear-gradient(0deg, rgba(0,0,0,.3), transparent 60%);
  content: "";
}
.story-hero .page-hero-copy,
.contact-hero .page-hero-copy { max-width: 1440px; margin-inline: auto; }
.story-hero .eyebrow,
.contact-hero .eyebrow,
.story-hero h1,
.contact-hero h1,
.story-hero .page-hero-copy > p:last-child,
.contact-hero .page-hero-copy > p:last-child { color: #fff; }
.story-hero h1 span,
.contact-hero h1 span { color: #fff; }

.story-content,
.contact-content {
  display: grid;
  grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr);
  align-items: start;
  column-gap: clamp(36px, 8vw, 120px);
  row-gap: 34px;
  max-width: 1120px;
  margin-inline: auto;
  padding-top: clamp(56px, 8vw, 112px);
  padding-bottom: clamp(56px, 8vw, 112px);
}
.story-content .story-lead,
.contact-content .contact-intro { max-width: 480px; }
.story-content h2,
.contact-content h2 { margin: 12px 0 0; font-size: clamp(40px, 6vw, 76px); line-height: .96; }
.story-content .story-body,
.contact-content .contact-cards { min-width: 0; }
.story-content .story-body > p { max-width: 660px; font-size: clamp(16px, 1.4vw, 19px); line-height: 1.8; }
.story-content .story-body .large-copy { font-size: clamp(20px, 2.2vw, 29px); line-height: 1.45; font-weight: 600; }
.story-content .brand-details { margin-top: 30px; background: #efeee9; border: 0; border-left: 3px solid #111; }
.story-content .button { margin-top: 24px; }
.story-image { position: relative; overflow: hidden; min-height: 320px; background: #171717; }
.story-image img { display: block; width: 100%; max-height: 680px; object-fit: cover; object-position: center 38%; }
.story-image p { margin: 0; padding: 18px 24px; color: #fff; background: #171717; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .16em; }
.story-image p span { color: #fff; }

.story-content::after {
  content: "OUR STORYLINE\A\AAMBITION WEAR is more than just a clothing brand, it's a lifestyle built around ambition, individuality and self-expression. Inspired by the mindset of dreamers, creatives and go-getters.";
  display: block;
  grid-column: 1 / -1;
  margin: 4px 0 0;
  padding: clamp(24px, 4vw, 44px);
  border-left: 4px solid #111;
  background: #efeee9;
  color: #222;
  white-space: pre-line;
  font-size: clamp(16px, 1.6vw, 20px);
  line-height: 1.8;
}

.contact-content { grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); }
.contact-content .contact-intro > p:last-child { max-width: 420px; color: #666; font-size: 16px; line-height: 1.8; }
.contact-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.contact-card {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(20px, 2.6vw, 30px);
  background: #f0efea;
  border: 1px solid #e1dfd7;
  color: #171717;
  text-decoration: none;
}
.contact-card:first-child { grid-column: 1 / -1; min-height: 245px; background: #171717; color: #fff; border-color: #171717; }
.contact-card .contact-icon { display: grid; width: 42px; height: 42px; margin-bottom: 22px; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 20px; }
.contact-card .eyebrow { color: #777; }
.contact-card:first-child .eyebrow { color: #fff; }
.contact-card h3 { margin: 8px 0; font-family: "Space Grotesk", "DM Sans", sans-serif; font-size: clamp(19px, 2vw, 26px); line-height: 1.15; }
.contact-card p { margin: 0 0 18px; color: #777; line-height: 1.6; }
.contact-card:first-child p { color: #d2d2d0; }
.contact-card strong { margin-top: auto; color: inherit; font-size: 14px; overflow-wrap: anywhere; }
.contact-card:hover { transform: translateY(-3px); background: #e8e7df; }
.contact-card:first-child:hover { background: #262626; }

@media (max-width: 760px) {
  .story-content,
  .contact-content { grid-template-columns: 1fr; gap: 28px; }
  .story-content .story-lead,
  .contact-content .contact-intro { max-width: 620px; }
  .story-image img { max-height: 560px; }
}
@media (max-width: 520px) {
  .story-content,
  .contact-content { padding-top: 48px; padding-bottom: 52px; }
  .contact-cards { grid-template-columns: 1fr; }
  .contact-card:first-child { grid-column: auto; }
  .contact-card,
  .contact-card:first-child { min-height: 0; padding: 22px; }
  .contact-card .contact-icon { margin-bottom: 16px; }
  .story-image { min-height: 240px; }
}
