//initialise variables
var gameBoard = [];

//init revealed array
var revealed = [];

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
var size = 8;

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

//percentage of available cells mines
var minePercent = 20;

//Array to contain positions of mines
var minePos = [];

//calc number of mines
var numOfMines = Math.floor(cellTotal * (minePercent / 100));

//determines if odd or even rows are offset
var margin = (size + 1) % 2; // 1 if 1st row needs offset

//Var to track if first reveal
var firstCell = true;

//Variable to track if game is in progress or not
var acceptAnswer = false;

//Generate board based on size
generateGameBoard = (sizeHex) => {
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

    //generate revealed mat to track which cells have been revealed
    revealed = [];

    for (i = 0; i < gameBoard.length; i++) {
        revealed.push([]);
        for (j = 0; j < gameBoard.length; j++) {
            revealed[i].push(gameBoard[i][j]);
        }
    }
}

//Fill board with mines
generateGameMines = (firsti, firstj) => {

    //init positions array
    minePos = [];

    //determines reletive index number of above/below row before 
    var offsetMin = (firsti + margin + 1) % 2;

    //determines relative index number of above/below cell after
    var offsetPlus = (firsti + margin) % 2;

    //list of available cells to randomly pick where mines are
    var availableCells = []

    //itirates through gameboard and adds valid cells to available cells array
    for (i = 0; i < gameBoard.length; i++) {
        for (j = 0; j < gameBoard.length; j++) {
            
            //doesn't add first click or surrounding cells to available cells array to make initial gameplay easier
            if(gameBoard[i][j] != null && 
                !(i == firsti && j == firstj) && 
                !(i == firsti && j == firstj+1) && 
                !(i == firsti && j == firstj-1) && 
                !(i == firsti-1 && j == firstj - offsetMin) &&
                !(i == firsti-1 && j == firstj + offsetPlus) &&
                !(i == firsti+1 && j == firstj-offsetMin) &&
                !(i == firsti+1 && j == firstj+offsetPlus)){

                //init valid co-ordinate
                var validij = [];

                //if a valid co-ord then push to i j array
                validij.push(i);
                validij.push(j);

                //push array to available cells array
                availableCells.push(validij);

            }
        }
    }

    //Choosing random cell index and adding to list of where mines are
    for (i = 0; i < numOfMines; i++) {

        //Generate rand based on what's left in available cells
        var rand = Math.floor(Math.random() * availableCells.length);

        //Addes to array
        minePos.push(availableCells[rand]);

        //Delete picked cell from available cells
        availableCells.splice(rand, 1);
    }

    //Calls fill gameboard fn
    fillGameMines();
}

//Update board with mines
fillGameMines = () => {

    //for each i,j pair in miePos array change gameboard co-ord to a mine (x)
    minePos.forEach(mineCoord  => {
        gameBoard[mineCoord[0]][mineCoord[1]] = "x";
    });

    //when all added calculate surrounding mines for each alid cell
    calculateSurroundCells();
}

//calculate number of surrounging mines for each cell
calculateSurroundCells = () => {
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

    printBoardConsole();
}

//logs gameboard to console in readable form
printBoardConsole = () => {
    var hexIndex = 0
    var boardString = "";
    for (i = 0; i < gameBoard.length; i++) {

        //adds indent if printing an offset row
        boardString += ((margin + i) % 2) == 1 ? "  " : "";

        //prints row. If null prints .
        for (j = 0; j < gameBoard.length; j++) {
            boardString += gameBoard[i][j] == null ? ".  " : gameBoard[i][j] + "  ";

                //increases cell index tracker
                hexIndex++;
            }

        //go to next line
        boardString += '\n'
    }

    //display output
    console.log(boardString);
}

//fn to create page elements
printBoardToPage = () => {

    //itirate through gameboard
    for (i = 0; i < gameBoard.length; i++) {
        for (j = 0; j < gameBoard.length; j++) {

            //if it's a cell, create element on page
            if (gameBoard[i][j] != null) {

                // Creates a cell at the correct position. Rows are 3/4 the height of a hex down + the vertical distance to create the correct margin between two angled lines
                //Horizontal position is index * hex width + the extra on the start if it's an offset row.
                createCellHex((.75 * hexH + (hexMargin / Math.cos(((2 * Math.PI / 360) * 30)))) * i, j * (hexW + hexMargin) + ((i + margin) % 2) * ((hexW + hexMargin) / 2), i, j, gameBoard[i][j]);
            }
        }
    }
}

//Creates hexagons given x pos, y pos and cell index
createCellHex = (x, y, indexi, indexj, val) => {

    //initialise div
    var newHex = document.createElement('div');

    //init top and bottom triangles
    var hexTop = document.createElement('div');
    var hexBottom = document.createElement('div');

    //classes to make divs look like triangles
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


        //if clicked pass the i and j co-ord to reveal handling fn
        var i = Number(e.currentTarget.dataset["indexi"]);
        var j = Number(e.currentTarget.dataset["indexj"]);

        //calls reveal fn for cell
        revealCell(i, j);
    });

    //Adding right-click event
    newHex.addEventListener("contextmenu", e => {

        //Calls toggle flag fn for cell
        toggleFlag(e.currentTarget.dataset.indexi, e.currentTarget.dataset.indexj);
        
        //Prevents the option menu coming up on right-click
        e.preventDefault();

    }, false);

    //adds top and bottom triangles as children
    newHex.appendChild(hexTop);
    newHex.appendChild(hexBottom);

    //Attach to document
    document.getElementById("gamecontainer").appendChild(newHex);
}

//Reveal cell method
revealCell = (i, j) => {

    //To calculate if below row is offset or not
    var offsetMin = (i + margin + 1) % 2;

    //to calculate if above row is offset or not
    var offsetPlus = (i + margin) % 2;

    //if it's the first cell clicked then fill the board with mines except cell clicked and surrounding
    if(firstCell == true){
        generateGameMines(i, j);
        firstCell = false;
    }

    //if cell hasn't been revealed before and accepting answers
    if(revealed[i][j] ==0 && acceptAnswer){

        //Sets revealed to 1 so fn can't run again
        revealed[i][j] = 1;

        //iterate though page elements to work out which was clicked
        document.querySelectorAll(".hexagon").forEach(cell => {

            

            //if it's the right one
            if (cell.dataset.indexi == i && cell.dataset.indexj == j) {

                //Sets colour to change elements to. lightblue if number or red if mine
                var cellColor = gameBoard[i][j] >=0 ? "#4d8eff": "#ff5252";

                //adds number to cell or a dot if it's a mine, nothing if it has no surrounding mines
                cell.innerHTML += gameBoard[i][j] > 0 ? gameBoard[i][j] : gameBoard[i][j] == "x"? "&#9679;": "";

                //if clicked on a mine cell
                if(gameBoard[i][j] == "x"){

                    //Trigger endgame events
                    endGame();
                }

                //Change the three elements of the hexagon to the colour
                cell.style.backgroundColor =  cellColor
                cell.querySelector('.hexTop').style.borderBottomColor = cellColor;
                cell.querySelector('.hexBottom').style.borderTopColor = cellColor;
            }

        });
    }
    
    //if it's a cell with no surrounging mines reveal self and all surrounging cells
    if (gameBoard[i][j] == 0) {

        //if left and right are valid and haven't been revealed call reveal method on them
        //if the surrounding cells contain flags these are removed by calling toggle flag first
        if (j + 1 <= gameBoard.length - 1 && revealed[i][j + 1] != 1){
            if (revealed[i][j + 1] == 2){toggleFlag(i,j+1)};
            revealCell(i, j + 1)
        }
        if (j - 1 >= 0 && revealed[i][j - 1] != 1) {
            if(revealed[i][j - 1] == 2){toggleFlag(i,j-1)};
            revealCell(i, j - 1)
        }

        //call reveal on above cells if haven't been revealed and are valid
        if (i - 1 >= 0) {
            if (j - offsetMin >= 0 && revealed[i - 1][j - offsetMin] != 1) {
                if(revealed[i - 1][j - offsetMin] == 2){toggleFlag(i-1,j-offsetMin)};
                revealCell(i - 1, j - offsetMin)
            }
            if (j + offsetPlus <= gameBoard.length - 1 && revealed[i - 1][j + offsetPlus] != 1) {
                if(revealed[i - 1][j + offsetPlus] == 2){toggleFlag(i-1, j+offsetPlus)};
                revealCell(i - 1, j + offsetPlus)
            }
        }

        //calls reveal fn on below cells if haven't been revealed and are valid
        if (i + 1 <= gameBoard.length - 1) {
            if (j - offsetMin >= 0 && revealed[i + 1][j - offsetMin] != 1) {
                if(revealed[i + 1][j - offsetMin] == 2){toggleFlag(i+1,j-offsetMin)};
                revealCell(i + 1, j - offsetMin)
            }
            if (j + offsetPlus <= gameBoard.length - 1 && revealed[i + 1][j + offsetPlus] != 1) {
                if(revealed[i + 1][j + offsetPlus] == 2){toggleFlag(i+1,j+offsetPlus)};
                revealCell(i + 1, j + offsetPlus)
            }
        }

    }
    if(checkComplete()){
        endGame();
        setTimeout( f => {alert("YOU WON!!!")}
            ,150);
    };
}

//check if all cells that don't contain mines have been revealed i.e. game over and player has won
checkComplete = () => {

    //itirate through game board
    for(i = 0; i < gameBoard.length; i++){
        for(j = 0; j < gameBoard.length; j++){

            //if it's a valid cell that's not a mine and hasn't been revealed
            if(gameBoard[i][j] != null && gameBoard[i][j] != "x" && revealed[i][j] != 1){
                
                //still cells left to reveal so return false
                return false;
            }
        }
    }

    //if iterated through all cells and all valids and non mines have been revealed then game is complete i.e. return true
    return true;
}

//fn to add/remove flags
toggleFlag = (i, j) => {

    //if game is in progress then do stuff
    if(acceptAnswer){

        //if the cell hasn't been revealed and there's no flag present
        if (revealed[i][j] == 0 && revealed[i][j] != 2) {

            //iterate throguh page elements to find corresponding element
            document.querySelectorAll(".hexagon").forEach(cell => {

                //when found
                if (cell.dataset.indexi == i && cell.dataset.indexj == j) {

                    //create div
                    var flagDiv = document.createElement('div');

                    //Add class that makes it look like a flag
                    flagDiv.classList.add('flag');

                    //append as child to page element
                    cell.appendChild(flagDiv);

                    //Change reveald to 2
                    revealed[i][j] = 2;
                }
            });

            //If cell already has a flag on it
        } else if (revealed[i][j] == 2) {

            //find corresponding page element
            document.querySelectorAll(".hexagon").forEach(cell => {

                //when found correct one
                if (cell.dataset.indexi == i && cell.dataset.indexj == j) {

                    //finds flag div in cell and removes it
                    cell.removeChild(cell.querySelector('.flag'));

                    //change revealed indicator back to 0
                    revealed[i][j] = 0;
                }
            })
        }
    }

    
}

revealMines = () => {

    var minesUnfound = [];

    var wrongFlags = [];

    for(i = 0; i < gameBoard.length; i++){
        for(j = 0; j < gameBoard.length; j++){
            
            //if cell is a mine and not revealed
            if(gameBoard[i][j] == "x" && revealed[i][j] == 0){
                
                //push coords to unfound mines array
                minesUnfound.push([i, j]);

            //if cell has a flag but is NOT a mine
            } else if(revealed[i][j] == 2 && gameBoard[i][j] != "x"){

                //push coors to wrong flags array
                wrongFlags.push([i, j]);
            }
        }
    }

    console.log(wrongFlags);

    delayRevealMines = () => {

        if(minesUnfound.length){
            
        var rand = Math.floor(Math.random() * minesUnfound.length);

        var cell = findCell(minesUnfound[rand][0], minesUnfound[rand][1]);

        console.log(cell);

        cell.innerHTML+= "&#9679";

        console.log(minesUnfound);
        
        minesUnfound.splice(rand, 1);
            setTimeout(delayRevealMines, 150);
        } else{
            delayRevealFlags();
        }
    }

    

    delayRevealFlags = () => {

        if(wrongFlags.length){

        var rand = Math.floor(Math.random() * wrongFlags.length);

        var cell = findCell(wrongFlags[rand][0], wrongFlags[rand][1]);

        console.log(cell);

        var newX = document.createElement('div');

        newX.classList.add('flagcross');

        cell.appendChild(newX);
        
        wrongFlags.splice(rand, 1);

        setTimeout(delayRevealFlags, 150);
        
        }
    }

    delayRevealMines();

}

getSurround = (i, j) => {

}

findCell = (i, j) => {
    var cellToReturn;
    document.querySelectorAll(".hexagon").forEach(cell => {
        if(cell.dataset.indexi == i && cell.dataset.indexj == j){

            cellToReturn = cell;
        }
    });

    return cellToReturn;
}

//fns to call on game start
startGame = () => {

    //generates gameboard given size input
    generateGameBoard(sizeHex);

    //creates page elements
    printBoardToPage();

    //After things are generated start accepting answers
    acceptAnswer = true;
}

//Endgame events
endGame = () => {
    //Stop accepting answers
    acceptAnswer = false;

    //Reveal mines
    revealMines();
}

//Calls start game on page load
startGame();