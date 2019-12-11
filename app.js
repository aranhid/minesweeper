var map = []
var isFirstClick = true
var fieldHeight = 12
var fieldWidth = 12
var bombCount = 10

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

    for (let i = 0; i < 12; i++) {
        map[i] = [];
        for (let j = 0; j < 12; j++) {
            map[i][j] = 0;
        }
    }
    for (let i = 0; i < bombCount; i++) {
        let x = getRandomInRange(0, 11);
        let y = getRandomInRange(0, 11);
        if (map[y][x] == -1 || !avoidCell(x, y)) {
            i--;
            continue;
        }
        map[y][x] = -1;
        for (let j = -1; j < 2; j++) {
            for (let l = -1; l < 2; l++) {
                if (y + j >= 0 && y + j <= 11 && x + l >= 0 && x + l <= 11) {
                    if (map[y + j][x + l] >= 0) {
                        map[y + j][x + l]++;
                    }
                }
            }
        }
    }
}

function openAllBombs() {
    for (let y = 0; y <= 11; y++) {
        for (let x = 0; x <= 11; x++) {
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
        //div.style.backgroundColor = "red";
        openAllBombs();
        //div.classList.add("bomb");
        return;
    }
    div.classList.add("opened");
    if (map[y][x] > 0) {
        div.innerText = map[y][x];
        div.style.backgroundColor = "yellow";
        return;
    }
    if (y - 1 >= 0) {
        openCell(x, y - 1);
    }
    if (x + 1 <= 11) {
        openCell(x + 1, y);
    }
    if (y + 1 <= 11) {
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

window.onload = function generateField() {
    let grid = document.querySelector(".grid");

    function createDiv(kekX, kekY) {
        let div = document.createElement('div');
        div.addEventListener('click', function () { openCell(kekX, kekY); });
        div.addEventListener('contextmenu', setFlag);
        return div;
    }

    //generateMap();

    for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) {
            let div = createDiv(x, y);
            div.className = "cell" + x + "x" + y;
            //div.innerText = map[y][x];
            grid.appendChild(div);
        }
    }

    /*document.addEventListener('keyup', function () {
        alert("TEST");
    }, { once: true });
    document.addEventListener('mousedown', function () {
        alert("TEST");
    }, { once: true });*/
}