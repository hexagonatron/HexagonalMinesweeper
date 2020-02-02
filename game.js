//initialise variables
var gameBoard = [];

//for reference
var test = [
    [0, 1, 1, 1, 1, 0, 0],   // 0
    [0, 1, 1, 1, 1, 1, 0],     // 1
    [1, 1, 1, 1, 1, 1, 0],   // 2
    [1, 1, 1, 1, 1, 1, 1],     // 3*
    [1, 1, 1, 1, 1, 1, 0],   // 4
    [0, 1, 1, 1, 1, 1, 0],     // 5
    [0, 1, 1, 1, 1, 0, 0]    // 6
];

//size of board in concentric hexs
var size = 6;

//Hexagon cell sizes
var hexW = 25;

//Given hex width calculate other parameters of hexagon
//Hex edge length
var hexE = hexW / Math.sqrt(3);

//Hex height
var hexH = hexE * 2;

//Border margin between cells
var hexMargin = 5;

//size of longest row
var sizeHex = size * 2 - 1

//calculates total number of valid cells
var cellTotal = 1;
for (i = 1; i < size; i++) {
    cellTotal += i * 6
}

console.log(cellTotal);

//percentage of available cells mines
var minePercent = 20;

//calc number of mines
var numOfMines = Math.floor(cellTotal * (minePercent / 100));

console.log(numOfMines);

//determines if odd or even rows are offset
var margin = (size + 1) % 2; // 1 if 1st row needs offset

for (i = 0; i < sizeHex; i++) {

    //initialise rows
    gameBoard.push([]);

    //determine how many valid cells are in each row
    cellsInRow = (sizeHex) - (Math.abs(size - 1 - i));

    //pushes number of valid cells to row
    for (j = 0; j < cellsInRow; j++) {
        gameBoard[i].push(0);
    }

    //pushes null for non valid cells to row.
    //Alternates add to start or add to end depending on margin and row num
    for (j = 0; j < sizeHex - cellsInRow; j++) {
        if ((margin + i + j) % 2) {
            gameBoard[i].push(null);
        } else {
            gameBoard[i].unshift(null);
        }
    }

}

var revealed = [];

for(i=0;i < gameBoard.length;i++){
    revealed.push([]);
    for(j=0;j < gameBoard.length;j++){
        revealed[i].push(gameBoard[i][j]);
    }
}

//Fill board with mines

//Indexes of where mines are going to be
var minePos = []

//list of available cells to randomly pick where mines are
var availableCells = []
for (i = 0; i < cellTotal; i++) {
    availableCells.push(i);
}

//Choosing random cell index and adding to list of where mines are
for (i = 0; i < numOfMines; i++) {

    //Generate rand based on what's left in available cells
    var rand = Math.floor(Math.random() * availableCells.length);

    //Addes to array in order

    //if less than 0th element or if array empty then added to start
    if (availableCells[rand] < minePos[0] || minePos.length == 0) {
        minePos.unshift(availableCells[rand]);

        //if larger than last element, added to end
    } else if (availableCells[rand] > minePos[minePos.length - 1]) {
        minePos.push(availableCells[rand]);

        //Else iterate through and insert into correct position
    } else {
        for (j = 0; j < minePos.length; j++) {
            if (availableCells[rand] < minePos[j] && availableCells[rand] > minePos[j - 1]) {
                minePos.splice(j, 0, availableCells[rand]);
            }
        }
    }

    //Delete picked cell from available cells
    availableCells.splice(rand, 1);
}

console.log(minePos)

//Update board with mines

//counts valid cells when iterating through gameboard array
var validCellcount = 0;

//keeps track of which mine to add while iterating through
var minePosIndex = 0;

for (i = 0; i < gameBoard.length; i++) {
    for (j = 0; j < gameBoard.length; j++) {

        //if not null then a valid cell
        if (gameBoard[i][j] != null) {

            //if valid cell index = mine position then change from 0 to x (mine)
            if (validCellcount == minePos[minePosIndex]) {
                gameBoard[i][j] = "x";

                //increase mine array index to add next mine
                minePosIndex++;
            }

            //increase valid cell count
            validCellcount++;
        }
    }
}


//calculate number of surrounging mines for each cell

//itirate through gameboard array
for (i = 0; i < gameBoard.length; i++) {
    for (j = 0; j < gameBoard.length; j++) {

        //if a valid cell and not a mine start calculation
        if (gameBoard[i][j] != null && gameBoard[i][j] != "x") {

            //start count at 0
            var count = 0;

            //determines reletive index number of above/below row before 
            var offsetMin = (i + margin + 1) % 2;

            //determines relative index number of above/below cell after
            var offsetPlus = (i + margin) % 2;

            //console.log(`i = ${i}, j = ${j}, offsetMin = ${offsetMin} OffsetPLus = ${offsetPlus}, margin = ${margin}`);

            //if not at edge
            if (j - 1 >= 0) {

                //if left is a mine
                if (gameBoard[i][j - 1] == "x") { count++; }
            }
            if (j + 1 <= gameBoard.length - 1) {

                //if right is a mine
                if (gameBoard[i][j + 1] == "x") { count++; }
            }
            if (i - 1 >= 0) {
                if (j - offsetMin >= 0) {

                    //if upper left is a mine
                    if (gameBoard[i - 1][j - offsetMin] == "x") { count++; }
                }

                if (j + offsetPlus <= gameBoard.length - 1) {

                    //if upper right is a mine
                    if (gameBoard[i - 1][j + offsetPlus] == "x") { count++; }
                }
            }
            if (i + 1 <= gameBoard.length - 1) {
                if (j - offsetMin >= 0) {

                    //if lower left is a mine
                    if (gameBoard[i + 1][j - offsetMin] == "x") { count++; }
                }

                if (j + offsetPlus <= gameBoard.length - 1) {

                    //if lower right is a mine
                    if (gameBoard[i + 1][j + offsetPlus] == "x") { count++; }
                }
            }

            //Set cell to surrounding mine #
            gameBoard[i][j] = count;
        }
    }
}


console.log(gameBoard);

//logs gameboard to console in readable form
printBoard = () => {
    var hexIndex = 0
    var boardString = "";
    for (i = 0; i < gameBoard.length; i++) {

        //adds intent if printing an offset row
        boardString += ((margin + i) % 2) == 1 ? "  " : "";

        //prints row. If null prints nothing
        for (j = 0; j < gameBoard.length; j++) {
            boardString += gameBoard[i][j] == null ? ".  " : gameBoard[i][j] + "  ";
            //boardString += gameBoard[i][j] + "  ";

            //if it's a cell, create element on page
            if (gameBoard[i][j] != null) {

                // Creates a cell at the correct position. Rows are 3/4 the height of a hex down + the vertical distance to create the correct margin between two angled lines
                //Horizontal position is index * hex width + the extra on the start if it's an offset row.
                createCellHex((.75 * hexH + (hexMargin / Math.cos(((2 * Math.PI / 360) * 30)))) * i, j * (hexW + hexMargin) + ((i + margin) % 2) * ((hexW + hexMargin) / 2), i, j, gameBoard[i][j]);

                //increases cell index tracker
                hexIndex++;
            }


        }

        //go to next line
        boardString += '\n'
    }

    //display output
    console.log(boardString);
}


//Creates hexagons given x pos, y pos and cell index
createCellHex = (x, y, indexi, indexj, val) => {

    //initialise div
    var newHex = document.createElement('div');

    var hexTop = document.createElement('div');
    var hexBottom = document.createElement('div');

    hexTop.classList.add("hexTop");

    hexBottom.classList.add("hexBottom");

    //Assign class name
    newHex.classList.add("hexagon");

    //Set position
    newHex.style.cssText = `top:${x}px;left:${y}px`;

    //Set index
    newHex.setAttribute("data-indexi", indexi);
    newHex.setAttribute("data-indexj", indexj);

    //Add click event
    newHex.addEventListener("click", e => {
        var i = Number(e.currentTarget.dataset["indexi"]);
        var j = Number(e.currentTarget.dataset["indexj"]);

        revealCell(i, j);
    })

    newHex.appendChild(hexTop);
    newHex.appendChild(hexBottom);

    //Attach to document
    document.getElementById("gamecontainer").appendChild(newHex);
}

revealCellFromClick = (clickEvent) => {

}

//Reveal cell method
revealCell = (i, j) => {
    console.log(`i = ${i}, j = ${j}`);

    var offsetMin = (i + margin + 1) % 2;

    var offsetPlus = (i + margin) % 2;

    

    console.log(`index i = ${i}, index j = ${j}`);

    if(revealed[i][j] ==0){
        document.querySelectorAll(".hexagon").forEach(cell => {
            if (cell.dataset.indexi == i && cell.dataset.indexj == j) {

                cell.innerHTML += gameBoard[i][j] > 0 ? gameBoard[i][j] : "";
                cell.style.backgroundColor = "#4d8eff";
                cell.querySelector('.hexTop').style.borderBottomColor = "#4d8eff";
                cell.querySelector('.hexBottom').style.borderTopColor = "#4d8eff";
            }

        })
    }
    
    
    revealed[i][j] = 1;

    if (gameBoard[i][j] == "x") {
        //end game
    } else if(gameBoard[i][j] != 0){

        
    } else if (gameBoard[i][j] == 0) {
    //reveal cell
    //call reveal for surrounding cells

    if (j + 1 <= gameBoard.length - 1 && revealed[i][j+1] == 0) { 
        revealCell(i, j+1)
    }
    if (j - 1 >= 0 && revealed[i][j-1] == 0) { 
        revealCell(i, j-1)
    }
    if (i - 1 >= 0) {
        if (j - offsetMin >= 0 && revealed[i-1][j - offsetMin] == 0) { 
            revealCell(i - 1,j - offsetMin) 
        }
        if (j + offsetPlus <= gameBoard.length - 1 && revealed[i-1][j + offsetPlus] == 0) {
            revealCell(i - 1,j + offsetPlus) 
        }
    }

    if (i + 1 <= gameBoard.length - 1) {
        if (j - offsetMin >= 0 && revealed[i+1][j-offsetMin] == 0) { 
            revealCell(i + 1,j - offsetMin) 
        }
        if (j + offsetPlus <= gameBoard.length - 1 && revealed[i+1][j+offsetPlus] == 0) { 
            revealCell(i + 1,j + offsetPlus) 
        }
    }

}
}

printBoard();