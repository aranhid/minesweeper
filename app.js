window.onload = function () {
    var map = []
    var fieldHeight = 12
    var fieldWidth = 12
    var bombCount = 10
    var closedCells = fieldWidth * fieldHeight;

    document.addEventListener("mine.step", function (event) {
        let x = event.detail.posX;
        let y = event.detail.posY;
        let mineStart = new CustomEvent("mine.start", { detail: { avoidX: x, avoidY: y } })
        document.dispatchEvent(mineStart);
        openCell(x, y);
    });

    document.addEventListener("mine.flag", setFlag);

    document.addEventListener("mine.focusCell", function (event) {
        document.querySelector(".cell" + event.detail.x + "x" + event.detail.y).focus();
    });

    generateField();

    window.addEventListener('focus', () => {
        let disp = this.getComputedStyle(document.querySelector('.popup'));
        if (disp.getPropertyValue("display") == "none")
            document.querySelector('.cell0x0').focus();
        else document.querySelector('.popup').focus();
    })

    function generateField() {
        closedCells = fieldWidth * fieldHeight;
        let grid = document.querySelector(".grid");
        grid.style.gridTemplateRows = "repeat(" + fieldHeight + ", 40px)";
        grid.style.gridTemplateColumns = "repeat(" + fieldWidth + ", 40px)";

        document.addEventListener("mine.start", function (event) {
            let avoidX = event.detail.avoidX;
            let avoidY = event.detail.avoidY;
            generateMap(avoidX, avoidY);
        }, { once: true });

        document.addEventListener("mine.end", function (event) {
            let gameStatus = event.detail.gameStatus;
            if (gameStatus === "lose")
                openAllBombs();
            sendMessage("You " + gameStatus + "!", gameStatus);

        }, { once: true });

        function createDiv(currentX, currentY) {
            let div = document.createElement('div');
            let stepEvent = new CustomEvent("mine.step", { detail: { posX: currentX, posY: currentY } });
            let flagEvent = new CustomEvent("mine.flag", { detail: { cell: div } });

            div.addEventListener('click', function () {
                document.dispatchEvent(stepEvent);
            });

            div.addEventListener('contextmenu', function () {
                event.preventDefault();
                document.dispatchEvent(flagEvent);
            });
            div.addEventListener('keydown', function (event) {
                if ((event.key == "Enter" || event.code == "Space") && event.ctrlKey) {
                    document.dispatchEvent(flagEvent);
                }
                if ((event.key == "Enter" || event.code == "Space") && !event.ctrlKey) {
                    document.dispatchEvent(stepEvent);
                }
                if (event.key == "ArrowDown" && currentY < fieldHeight - 1) {
                    let focusCell = new CustomEvent("mine.focusCell", { detail: { x: currentX, y: currentY + 1 } });
                    document.dispatchEvent(focusCell);
                }
                if (event.key == "ArrowUp" && currentY > 0) {
                    let focusCell = new CustomEvent("mine.focusCell", { detail: { x: currentX, y: currentY - 1 } });
                    document.dispatchEvent(focusCell);
                }
                if (event.key == "ArrowLeft" && currentX > 0) {
                    let focusCell = new CustomEvent("mine.focusCell", { detail: { x: currentX - 1, y: currentY } });
                    document.dispatchEvent(focusCell);
                }
                if (event.key == "ArrowRight" && currentX < fieldWidth - 1) {
                    let focusCell = new CustomEvent("mine.focusCell", { detail: { x: currentX + 1, y: currentY } });
                    document.dispatchEvent(focusCell);
                }
            })
            return div;
        }

        for (let y = 0; y < fieldHeight; y++) {
            for (let x = 0; x < fieldWidth; x++) {
                let div = createDiv(x, y);
                div.className = "cell" + x + "x" + y;
                div.tabIndex = -1;
                grid.appendChild(div);
                if (x == 0 && y == 0)
                    div.focus();
            }
        }
    }

    function generateMap(avoidX, avoidY) {
        function avoidCell(currentX, currentY) {
            for (let iX = avoidX - 1; iX <= avoidX + 1; iX++) {
                for (let iY = avoidY - 1; iY <= avoidY + 1; iY++) {
                    if (currentX == iX && currentY == iY)
                        return false;
                }
            }
            return true;
        }

        function getRandomInRange(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        for (let i = 0; i < fieldHeight; i++) {
            map[i] = [];
            for (let j = 0; j < fieldWidth; j++) {
                map[i][j] = 0;
            }
        }

        for (let i = 0; i < bombCount; i++) {
            let x = getRandomInRange(0, fieldWidth - 1);
            let y = getRandomInRange(0, fieldHeight - 1);
            if (map[y][x] == -1 || !avoidCell(x, y)) {
                i--;
                continue;
            }
            map[y][x] = -1;
            for (let j = -1; j < 2; j++) {
                for (let l = -1; l < 2; l++) {
                    if (y + j >= 0 && y + j < fieldHeight && x + l >= 0 && x + l < fieldWidth) {
                        if (map[y + j][x + l] >= 0) {
                            map[y + j][x + l]++;
                        }
                    }
                }
            }
        }
    }

    function deleteField() {
        for (let y = 0; y < fieldHeight; y++) {
            for (let x = 0; x < fieldWidth; x++) {
                let div = document.querySelector(".cell" + x + "x" + y);
                div.remove();
            }
        }
    }

    function openAllBombs() {
        for (let y = 0; y < fieldHeight; y++) {
            for (let x = 0; x < fieldWidth; x++) {
                if (map[y][x] == -1) {
                    let div = document.querySelector(".cell" + x + "x" + y);
                    if (!div.classList.contains("flag")) {
                        div.classList.add("bomb");
                    }
                }
            }
        }
    }

    function openCell(x, y) {
        let div = document.querySelector(".cell" + x + "x" + y);
        if (div.classList.contains("opened") || div.classList.contains("flag"))
            return;

        if (map[y][x] == -1) {
            let gameOverEvent = new CustomEvent("mine.end", { detail: { gameStatus: "lose" } })
            document.dispatchEvent(gameOverEvent);
            return;
        }
        div.classList.add("opened");
        closedCells--;
        if (closedCells == bombCount) {
            let gameOverEvent = new CustomEvent("mine.end", { detail: { gameStatus: "win" } })
            document.dispatchEvent(gameOverEvent);
            return;
        }
        if (map[y][x] > 0) {
            div.innerText = map[y][x];
            div.style.backgroundColor = "yellow";
            return;
        }
        if (y - 1 >= 0) {
            openCell(x, y - 1);
        }
        if (x + 1 < fieldWidth) {
            openCell(x + 1, y);
        }
        if (y + 1 < fieldHeight) {
            openCell(x, y + 1);
        }
        if (x - 1 >= 0) {
            openCell(x - 1, y);
        }
    }

    function setFlag(event) {
        let cell = event.detail.cell;
        if (cell.classList.contains("opened"))
            return;
        if (cell.classList.contains("flag")) {
            cell.classList.remove("flag");
        }
        else {
            cell.classList.add("flag");
        }
    }

    function sendMessage(string, gameStatus) {
        document.querySelector('.popup').style.display = "block";
        document.querySelector('.popupButton').tabIndex = 999;
        document.querySelector('.popupButton').focus();
        document.querySelector('.popupButton').addEventListener('mouseup', closePopup, { once: true });
        document.querySelector('.popupButton').addEventListener('keydown', closePopup, { once: true });
        document.querySelector('.popupMessage').innerText = string;
        if (gameStatus === "win") {
            document.querySelector('.popupWindow').style.backgroundColor = "#1ab61a";
        }
        else {
            document.querySelector('.popupWindow').style.backgroundColor = "#e62020";
        }
    }

    function closePopup() {
        document.querySelector('.popup').style.display = "none";
        deleteField();
        generateField();
    }
}