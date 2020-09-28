import blacklist from "./blacklist.js";

export function main(chrome) {
  var onSite = false;

  blacklist.forEach((site) => {
    if (String(document.location.host).toLowerCase().includes(site.toLowerCase())) onSite = true;
  });

  //   var p = document.querySelector("body p");
  //   if (p) p.innerHTML = "You are " + (!onSite ? "not " : "") + "on a restricted website !";

  if (!onSite) return;
  else {
    var s = document.createElement("script");
    s.src = chrome.extension.getURL("script.js");
    (document.head || document.documentElement).appendChild(s);
    s.onload = function () {
      s.parentNode.removeChild(s);
    };
  }
}
