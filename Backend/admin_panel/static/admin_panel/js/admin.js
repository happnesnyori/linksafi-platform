function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  var tab = document.getElementById(tabId);
  if (tab) { tab.classList.add('active'); }
  if (event && event.target) { event.target.classList.add('active'); }
}
