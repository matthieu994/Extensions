function removeWebsite(website) {
  chrome.storage.sync.get(["user_websites"], function (result) {
    let user_websites = result.user_websites || [];
    let index = user_websites.indexOf(website);
    if (index > -1) {
      let clone = user_websites.slice();
      clone.splice(index, 1);
      chrome.storage.sync.set({
        user_websites: clone,
      });
      document.querySelector("#remove_website").hidden = true;
      document.querySelector("#add_website").hidden = false;
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { reload: website });
      });
    }
  });
}
function addWebsite(website) {
  chrome.storage.sync.get(["user_websites"], function (result) {
    let user_websites = result.user_websites || [];
    if (!user_websites.includes(website)) {
      chrome.storage.sync.set({
        user_websites: user_websites.concat(website),
      });
      chrome.runtime.sendMessage({ injectScript: true });
      document.querySelector("#remove_website").hidden = false;
      document.querySelector("#add_website").hidden = true;
    }
  });
}

/* Check if tab URL is in list */
async function handleTab(url) {
  const match_list = await getWebsites(url);

  document.querySelector("#loader").hidden = true;
  if (match_list.length > 0 && !!url.match(regexWords(match_list))) {
    document.querySelector("#remove_website").hidden = false;
  } else {
    document.querySelector("#add_website").hidden = false;
  }
}
function regexWords(words) {
  return new RegExp("(" + words.join("|") + ")", "g");
}
function getWebsites(url) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "../websites.json");
    xhr.onload = function () {
      chrome.storage.sync.get(["user_websites"], (result) => {
        if (!!url.match(regexWords(JSON.parse(xhr.responseText)))) {
          document.querySelector("#remove_website button").disabled = true;
        }
        resolve(
          JSON.parse(xhr.responseText).concat(result.user_websites || [])
        );
      });
    };
    xhr.send();
  });
}

(async () => {
  chrome.tabs.getSelected(null, async (tab) => {
    const host = new URL(tab.url).host.replace("www.", "");
    handleTab(host);
    document
      .querySelectorAll("span.website_url")
      .forEach((el) => (el.innerHTML = host));
    document
      .querySelector("#remove_website button")
      .addEventListener("click", () => {
        removeWebsite(host);
      });
    document
      .querySelector("#add_website button")
      .addEventListener("click", () => {
        addWebsite(host);
      });
  });
})();
