"use strict";

const createInputElement = () => {
  const inputElement = document.createElement("input");
  inputElement.classList.add("col", "form-control", "my-4");
  inputElement.placeholder = "Upiši pjesmu ili izvođača";
  return inputElement;
};

const createResultTable = () => {
  const tableElement = document.createElement("table");
  tableElement.classList.add("table", "table-striped", "table-bordered");
  return tableElement;
};

const pjesma = (root) => {
  // DOM elements
  let rootElement = null;
  let searchInputElement = null;
  let resultTable = null;
  let spinner = document.querySelector("#spinner");

  const init = (root) => {
    initDOM(root);
    initEventListener(searchInputElement);
  };

  const initDOM = (root) => {
    try {
      rootElement = document.querySelector(root);

      if (!rootElement) {
        throw new Error("Element ne postoji u DOM-u");
      }

      searchInputElement = createInputElement();
      resultTable = createResultTable();

      rootElement.append(searchInputElement, resultTable);
    } catch (error) {
      console.error(error);
    }
  };

  const initEventListener = (input) => {
    input.addEventListener("keyup", (e) => {
      searchAPI(input.value, spinner, resultTable);
    });
  };

  const searchAPI = async (termItem, spinner, table) => {
    spinner.style.display = "block";

    try {
      const odgovor = await fetch(`https://itunes.apple.com/search?term=${termItem}&entity=song`, { method: "GET" });
      const pjesma = await odgovor.json();

      if (odgovor.ok) {
        const tbody = document.createElement("tbody");
        console.log("pjesme", pjesma);

        if (pjesma.resultCount > 0) {
          table.innerHTML = "";

          const headerRow = document.createElement("tr");
          const headerCells = ["Redni broj", "Izvođač", "Ime pjesme", "Ime albuma", "Sample"];

          headerCells.forEach((cellText) => {
            const headerCell = document.createElement("th");
            headerCell.textContent = cellText;
            headerRow.appendChild(headerCell);
          });

          tbody.appendChild(headerRow);

          pjesma.results.forEach((element, index) => {
            const row = document.createElement("tr");
            const rowNum = document.createElement("td");
            const artistCell = document.createElement("td");
            const trackCell = document.createElement("td");
            const collectionName = document.createElement("td");
            const previewUrl = document.createElement("td");
            const audioElement = document.createElement("audio");
            audioElement.controls = true;
            audioElement.preload = "none";

            rowNum.textContent = `${index + 1}`;
            artistCell.textContent = `${element.artistName}`;
            trackCell.textContent = `${element.trackName}`;
            collectionName.textContent = `${element.collectionName}`;

            audioElement.dataset.src = `${element.previewUrl}`;
            audioElement.src = `${element.previewUrl}`;

            audioElement.addEventListener("click", function () {
              if (this.preload !== "auto") {
                this.preload = "auto";
              }
            });

            previewUrl.appendChild(audioElement);

            row.append(rowNum, artistCell, trackCell, collectionName, previewUrl);
            tbody.append(row);
          });
        } else {
          table.innerHTML = "";

          const emptyRow = document.createElement("tr");
          const emptyCell = document.createElement("td");
          emptyCell.textContent = "Nema rezultata za navedeni upit.";

          emptyRow.append(emptyCell);
          tbody.append(emptyRow);
        }

        table.append(tbody);
      }
    } catch (error) {
      table.innerHTML = "";
      const errorMessageRow = document.createElement("tr");
      const errorMessageCell = document.createElement("td");
      errorMessageCell.textContent = "Greška prilikom dohvaćanja podataka. Molimo, pokušajte ponovno.";
      errorMessageRow.appendChild(errorMessageCell);
      tbody.appendChild(errorMessageRow);
      table.append(tbody);
      console.error("Greška prilikom dohvaćanja podataka:", error);
    }
  };

  init(root);
};

pjesma("#pjesma");
