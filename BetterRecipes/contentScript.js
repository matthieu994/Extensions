if (!window.contentScriptInjected) {
  window.contentScriptInjected = true;
  chrome.runtime.onMessage.addListener((message) => {
    if (message.reload) window.location.reload();
  });
  main();
}

function main() {
  const exclude_words = [
    "dry",
    "ground",
    "black",
    "and",
    "large",
    "pure",
    "petit",
    "de",
    "ou",
    "or",
    "en",
    "la",
    "pâte",
    "votre",
    "pour",
    "bonne",
    "qualité",
    "dorer",
    "baking",
  ];
  const quantities = [
    "c.",
    "tbsp",
    "tsp",
    "pot",
    "granulated",
    "pound",
    "paquet",
    "cl",
    "g",
    "sachet",
    "kg",
    "teaspoon",
    "tablespoon",
    "cup",
    "and",
    "cuillère",
    "à",
    "soupe",
    "à café",
    "rase",
    "goutte",
    "louche",
    "pincée",
  ];
  function isValidIngredient(ingredient) {
    return (
      ingredient.length > 1 &&
      !exclude_words.includes(ingredient.toLowerCase()) &&
      !ingredient.includes("(") &&
      !isValidQuantity(ingredient)
    );
  }
  function isValidQuantity(quantity) {
    return (
      quantity.length == 1 ||
      parseFloat(quantity) ||
      quantities.includes(quantity.toLowerCase()) ||
      quantities.includes(quantity.toLowerCase().slice(0, -1))
    );
  }

  const ingredientsDOM = document.querySelectorAll(
    "[class*='ingredients'] ul, [class*='ingredient-lists'"
  );
  let instructionsDOM = Array.from(
    document.querySelectorAll(
      "[class*='instructions'] li,[class*='preparation'] li, [class*='directions'] li"
    )
  )
    .map((el) => {
      return el.parentElement;
    })
    .sort((a, b) => (a.children.length < b.children.length ? 1 : -1))[0];
  ingredientsDOM.forEach((el) => {
    if (el?.childNodes && !el.parentNode.className.match("modal"))
      getIngredients(el);
  });

  function getIngredients(ingredientsEl) {
    let ingredients = new Map();
    ingredientsEl.childNodes.forEach((li) => {
      let ingredients_array = li.textContent
        .replace(/\s+/g, " ")
        .replace("d'", "")
        .trim()
        .split(" ");

      // Get quantity
      let quantity = [];
      for (let i = 0; i < ingredients_array.length; i++) {
        if (
          !isValidQuantity(ingredients_array[i]) &&
          !quantities.includes(
            ingredients_array[i - 1]?.toLowerCase() +
              " " +
              ingredients_array[i].toLowerCase()
          )
        )
          break;
        else quantity.push(ingredients_array[i]);
      }

      // Get ingredient
      let ingredient = [];
      for (let i = 0; i < ingredients_array.length; i++) {
        if (ingredients_array[i].includes("(")) break;
        if (
          (isValidIngredient(ingredients_array[i]) || ingredient.length == 1) &&
          ingredient.length <= 2 &&
          !quantities.includes(
            ingredients_array[i - 1]?.toLowerCase() +
              " " +
              ingredients_array[i].toLowerCase()
          )
        ) {
          ingredient.push(
            ingredients_array[i]
              .replace(/[^\u00BF-\u1FFF\u2C00-\uD7FF-'\w ]+/gi, "")
              .toLowerCase()
              .trim()
          );
        }
      }
      if (ingredient.length > 0 && quantity.length > 0)
        ingredients.set(ingredient.join(" ").trim(), quantity.join(" "));
    });
    for (const entry of ingredients) console.log(entry);
    console.log(instructionsDOM);

    // Replace in instructions with complete ingredient
    instructionsDOM.childNodes.forEach((li) => {
      // console.log(li.textContent);
      for (const pair of ingredients) {
        const matches = li.innerHTML?.match(pair[0]);
        if (!!matches?.index && !li.innerHTML?.match(`for="${pair[0]}"`)) {
          // next position of '.' or ' ' or ','
          const pos =
            li.innerHTML.slice(matches.index + pair[0].length).match(/[\s,\.]+/)
              .index +
            matches.index +
            pair[0].length;
          // console.log(matches, pos, "1");
          insertIntoLi(li, pos, pair);
          ingredients.delete(pair[0]);
        }
      }
    });
    // Replace in instruction with 2 first strings of ingredient
    instructionsDOM.childNodes.forEach((li) => {
      for (const pair of ingredients) {
        const key = pair[0].split(" ").slice(0, -1).join(" ");
        const matches = li.innerHTML?.match(key);
        if (!!matches?.index && !li.innerHTML?.match(`for="${pair[0]}"`)) {
          const pos =
            li.innerHTML.slice(matches.index + pair[0].length).match(/[\s,\.]+/)
              .index +
            matches.index +
            pair[0].length;
          console.log(matches, pos, "2");
          insertIntoLi(li, pos, pair);
          ingredients.delete(pair[0]);
        }
      }
    });
    // Replace in instructions with every string of ingredient
    instructionsDOM.childNodes.forEach((li) => {
      const searchString = li.textContent.split(/[\s,\.]+/);
      // console.log(li.textContent);
      for (const pair of ingredients) {
        for (const key of pair[0].split(" ")) {
          if (!ingredients.has(pair[0])) continue;
          const matches = searchString.indexOf(key);
          if (matches > -1 && isValidIngredient(key)) {
            // console.log(matches, key);
            // insertIntoLi(li,)
            li.innerHTML = li.innerHTML.replace(
              key,
              `${key}<span class="quantity" for="${pair[0]}">(${pair[1]})</span>`
            );
            ingredients.delete(pair[0]);
          }
        }
      }
    });
    console.log(ingredients);
  }

  function insertIntoLi(li, pos, pair) {
    li.innerHTML =
      li.innerHTML.slice(0, pos) +
      `<span class="quantity" for="${pair[0]}">(${pair[1]})</span>` +
      li.innerHTML.slice(pos);
  }
}
