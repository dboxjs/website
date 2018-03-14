import { WebsitePage } from './app.po';

describe('website App', () => {
  let page: WebsitePage;

  beforeEach(() => {
    page = new WebsitePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
