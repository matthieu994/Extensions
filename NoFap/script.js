(function () {
  if (document.querySelector("#nofap-overlay")) return;

  var div = document.createElement("div");
  div.id = "nofap-overlay";
  let span = document.createElement("span");
  span.innerHTML = "You are on a restricted website !";
  div.appendChild(span);
  document.body.appendChild(div);
  document.body.style.overflow = "hidden";
})();
