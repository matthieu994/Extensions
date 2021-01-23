let match_list = [];
chrome.runtime.onInstalled.addListener(() => {
  match_list = getWebsites();
});
chrome.tabs.onUpdated.addListener((_id, _change, tab) =>
  handleTab(tab.url, tab.id)
);
chrome.tabs.onActivated.addListener(async (info) => {
  chrome.tabs.get(info.tabId, async (tab) => {
    handleTab(tab.url, tab.id);
  });
});
chrome.runtime.onMessage.addListener((message) => {
  chrome.tabs.getSelected(null, async (tab) => {
    if (!!message.injectScript && (tab.url.match(/\//g) || []).length >= 4)
      insertScript(tab.id);
  });
});

function insertScript(tabId) {
  chrome.tabs.executeScript(tabId, {
    file: "contentScript.js",
  });
  chrome.tabs.insertCSS(tabId, {
    code: "span.quantity { font-weight: bold }",
  });
}

async function handleTab(url, tabId) {
  match_list = await getWebsites();
  console.log(match_list);

  if (
    url.includes("http") &&
    match_list.length > 0 &&
    !!new URL(url).host.match(regexWords(match_list)) &&
    (url.match(/\//g) || []).length >= 4
  ) {
    insertScript(tabId);
  }
}

function regexWords(words) {
  return new RegExp("(" + words.join("|") + ")", "g");
}

function getWebsites() {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./websites.json");
    xhr.onload = function () {
      chrome.storage.sync.get(["user_websites"], (result) => {
        resolve(JSON.parse(xhr.responseText).concat(result.user_websites));
      });
    };
    xhr.send();
  });
}
