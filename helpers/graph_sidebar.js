

class Sidebar {
  constructor(selector, levels) {
    this.levels = levels;
    this.selector = $(selector);
    this.selector.html(`<div class="panels-flex" style="width: ${Object.keys(levels).length}00%"></div>`);
    this.container = $('.panels-flex', this.selector);
    this._currentPanelIndex = 0;
    this._currentPanelID = levels[0];
    let panels = {};
    Object.keys(this.levels).forEach(index => {panels[levels[index]] = {html: '', title: '', id: levels[index], index: index}});
    this.panels = panels;
    this.panelChangeTimeout = false;
    let that = this;
    Object.keys(this.panels).forEach(function(id) {
      that.createPanel(that.panels[id])
    })
  }
  setCurrentPanel(panel_id, timeout) {
    if (this.panelChangeTimeout) {
      clearTimeout(this.panelChangeTimeout);
      this.panelChangeTimeout = false;
    }
    if (typeof timeout !== 'undefined') {
      let that = this;
      this.panelChangeTimeout = setTimeout(function() {
        that.setCurrentPanel(panel_id)
      }, timeout);
      return;
    }
    if (panel_id === this._currentPanelID) {
      // Same panel, no need to move
      return;
    }
    let that = this;
    Object.keys(this.levels).forEach(function(index) {
      if (that.levels[index] === panel_id) {
        that._currentPanelIndex = index
      }
    });

    // this.levels.findIndex(val => val === panel_id);
    this._currentPanelID = panel_id;
    this.animateToCurrentPanel()
  }
  setSlide(panel_id, html, title) {
    this.panels[panel_id].html = html;
    this.panels[panel_id].title = title;
    this.updatePanelContent(this.panels[panel_id]);
    this.setCurrentPanel(panel_id);
  }
  updatePanelContent(panel) {
    let html = `
    <div class="panel__interior">
      <h4 class="panel__title">${panel.title}</h4>
      <div class="panel__content">${panel.html}</div>
    </div>
    `
    $('.sidebar-panel[data-panel-id="' + panel.id + '"]', this.container).html(html)
  }
  createPanel(panel) {
    let html = `
    <div class="sidebar-panel" data-panel-id="${panel.id}" style="order: ${panel.index}"></div>
`;
    this.container.append(html);
    this.updatePanelContent(panel);
  }
  animateToCurrentPanel() {
    $('.panels-flex').css('margin-left', `-${this._currentPanelIndex}00%`)
  }
}


export {Sidebar}