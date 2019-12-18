window.onload = function () {
    var map = []
    var isFirstClick = true
    var fieldHeight = 12
    var fieldWidth = 12
    var bombCount = 10
    var closedCells = fieldWidth * fieldHeight;
    isWin = false;

    generateField();

    window.addEventListener('focus',() => {
        let disp = this.getComputedStyle(document.querySelector('.popup'));
        if(disp.getPropertyValue("display") == "none")
            document.querySelector('.cell0x0').focus();
        else document.querySelector('.popup').focus();
    })

    function generateField() {
        isFirstClick = true;
        closedCells = fieldWidth * fieldHeight;
        let grid = document.querySelector(".grid");
        grid.style.gridTemplateRows = "repeat(" + fieldHeight + ", 40px)";
        grid.style.gridTemplateColumns = "repeat(" + fieldWidth + ", 40px)";

        function createDiv(currentX, currentY) {
            let div = document.createElement('div');
            div.addEventListener('click', function () { openCell(currentX, currentY); });
            div.addEventListener('contextmenu', setFlag);
            div.addEventListener('keydown', function(event) {
                if ((event.key == "Enter" || event.code == "Space") && event.ctrlKey)
                {
                    let h = new Event("contextmenu");
                    div.dispatchEvent(h);
                }
                if ((event.key == "Enter" || event.code == "Space") && !event.ctrlKey)
                    openCell(currentX, currentY);
                if (event.key == "ArrowDown" && currentY < fieldHeight - 1)
                {
                    document.querySelector(".cell"+currentX+"x"+(currentY+1)).focus();
                }
                if (event.key == "ArrowUp" && currentY > 0)
                {
                    document.querySelector(".cell"+currentX+"x"+(currentY-1)).focus();
                }
                if (event.key == "ArrowLeft" && currentX > 0)
                {
                    document.querySelector(".cell"+(currentX-1)+"x"+currentY).focus();
                }
                if (event.key == "ArrowRight" && currentX < fieldWidth - 1)
                {
                    document.querySelector(".cell"+(currentX+1)+"x"+currentY).focus();
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
        if (isFirstClick) {
            generateMap(x, y);
            isFirstClick = false;
        }
        let div = document.querySelector(".cell" + x + "x" + y);
        if (div.classList.contains("opened") || div.classList.contains("flag"))
            return;
        if (map[y][x] == -1) {
            openAllBombs();
            isWin = false;
            sendMessage("You lose!");
            return;
        }
        div.classList.add("opened");
        closedCells--;
        if (closedCells == bombCount) {
            isWin = true;
            sendMessage("You win!");
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
        event.preventDefault();
        if (this.classList.contains("opened"))
            return;
        if (this.classList.contains("flag")) {
            this.classList.remove("flag");
        }
        else {
            this.classList.add("flag");
        }
    }

    function sendMessage(string) {
        document.querySelector('.popup').style.display = "block";
        document.querySelector('.popupButton').tabIndex = 999;
        document.querySelector('.popupButton').focus();
        document.querySelector('.popupButton').addEventListener('mouseup', closePopup, {once: true});
        document.querySelector('.popupButton').addEventListener('keydown', closePopup, {once: true});
        document.querySelector('.popupMessage').innerText = string;
        if(isWin)
        {
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