import { AngularD3Page } from './app.po';

describe('angular-d3 App', () => {
  let page: AngularD3Page;

  beforeEach(() => {
    page = new AngularD3Page();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
