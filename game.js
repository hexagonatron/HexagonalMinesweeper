//initialise variables
var gameBoard = [];

//init revealed array
var revealed = [];

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

var wonGame = false;

//track if CTRL key is down
var ctrDown = false;

//to deal with rapid triggering of keypress event
var lastCtrDown = false;

//to track which cell mouse is over
var hover = [];

//track which is highlighted
var highlighted= [];

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

            var surround = getSurround(i, j);


            //if a valid cell and not a mine start calculation
            if (gameBoard[i][j] != null && gameBoard[i][j] != "x") {

                //start count at 0
                var count = 0;

                surround.forEach( countMines = (cell) => {
                    
                    if(gameBoard[cell[0]][cell[1]] == "x"){count++}

                });

                //Set cell to surrounding mine #
                gameBoard[i][j] = count;
            }
        }
    }

    printBoardConsole();
}

//logs gameboard to console in readable form
printBoardConsole = () => {

    //init output string
    var boardString = "";

    for (i = 0; i < gameBoard.length; i++) {

        //adds indent if printing an offset row
        boardString += ((margin + i) % 2) == 1 ? "  " : "";

        //prints row. If null prints .
        for (j = 0; j < gameBoard.length; j++) {
            boardString += gameBoard[i][j] == null ? ".  " : gameBoard[i][j] + "  ";
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
                createCellHex((.75 * hexH + (hexMargin / Math.cos(((2 * Math.PI / 360) * 30)))) * i, j * (hexW + hexMargin) + ((i + margin) % 2) * ((hexW + hexMargin) / 2), i, j);
            }
        }
    }
}

//Creates hexagons given x pos, y pos and cell index
createCellHex = (x, y, indexi, indexj) => {

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

        if(revealed[i][j] == 1 && acceptAnswer && gameBoard[i][j] > 0 && ctrDown){
            revealAllSurround(i, j);
        }

    });

    newHex.addEventListener("mouseenter", e => {

        //get i and j of mouse over
        var i = e.target.dataset.indexi;
        var j = e.target.dataset.indexj;

        hover[0] = i;
        hover[1] = j;

        highlightRevealSurround();

    });

    newHex.addEventListener("mouseleave", e => {

        //get i and j of mouse over
        var i = e.target.dataset.indexi;
        var j = e.target.dataset.indexj;

        //set hover to nothing on mouse leave
        hover = [];
        highlightRevealSurround();

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

    //if it's the first cell clicked then fill the board with mines except cell clicked and surrounding
    if(firstCell == true){
        generateGameMines(i, j);
        firstCell = false;
    }

    //if cell hasn't been revealed before and accepting answers
    if (revealed[i][j] == 0 && acceptAnswer) {

        //Sets revealed to 1 so fn can't run again
        revealed[i][j] = 1;

        //finds cell element on page
        cell = findCell(i, j);

        //Sets colour to change elements to. lightblue if number or red if mine
        var cellColor = gameBoard[i][j] >= 0 ? "#4d8eff" : "#ff5252";

        //adds number to cell or a dot if it's a mine, nothing if it has no surrounding mines
        cell.innerHTML += gameBoard[i][j] > 0 ? gameBoard[i][j] : gameBoard[i][j] == "x" ? "&#9679;" : "";

        //if clicked on a mine cell
        if (gameBoard[i][j] == "x") {

            //Trigger endgame events
            endGame();
        }

        //Change the three elements of the hexagon to the colour
        cell.style.backgroundColor = cellColor
        cell.querySelector('.hexTop').style.borderBottomColor = cellColor;
        cell.querySelector('.hexBottom').style.borderTopColor = cellColor;
    }
    
    //if it's a cell with no surrounging mines reveal self and all surrounging cells
    if (gameBoard[i][j] == 0 && acceptAnswer) {

        //init surroung array
        var surround;

        //gets surrounding points from fn
        surround = getSurround(i,j);

        //for each pair of surround coords do stuff 
        surround.forEach(cell  => {

            //if it hasn't been revealed
            if(revealed[cell[0]][cell[1]] != 1){
                
                // if it's a flag toogle flag to remove
                if (revealed[cell[0]][cell[1]] == 2) { toggleFlag(cell[0], cell[1]) }

                //call reveal cell on specific cell
                revealCell(cell[0], cell[1]);
            }
        });

    }

    //calls check complere fn. if true i.e. player has won then do stuff
    if(checkComplete()){

        wonGame = true;

        //end game
        endGame();
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

//fn to reveal all surroung
revealAllSurround = (i, j) => {

    var surround = getSurround(i, j);

    var flagCount = 0

    surround.forEach(coord => {
        var coodi = coord[0];
        var coodj = coord[1];

        if(revealed[coodi][coodj] == 2){flagCount++};

    });

    if(flagCount == gameBoard[i][j]){
        surround.forEach(coord => {
            coordi = coord[0];
            coordj = coord[1];

            revealCell(coordi, coordj);
        })
    }
}

highlightRevealSurround = () => {
    
    if (highlighted.length){


        i = highlighted[0];
        j = highlighted[1];

        var surroundRevert = getSurround(i, j);

        surroundRevert.forEach(coordRevert => {

            var surroundReverti = coordRevert[0];
            var surroundRevertj = coordRevert[1];

            if(revealed[surroundReverti][surroundRevertj] == 0){

                var revertCell = findCell(surroundReverti, surroundRevertj);

                var normalColour = "#0A5CE8"

                revertCell.style.backgroundColor = normalColour;
                revertCell.querySelector('.hexTop').style.borderBottomColor = normalColour;
                revertCell.querySelector('.hexBottom').style.borderTopColor = normalColour;
            }

        });
        
        highlighted = [];

    } else {        
        
        if(acceptAnswer && ctrDown && hover.length){
            
            var i = hover[0];
            var j = hover[1];
            if(revealed[i][j] == 1 && gameBoard[i][j] > 0) {
                
                var surround = getSurround(i, j);
                
                surround.forEach(coord => {
                    var surroundi = coord[0];
                    var surroundj = coord[1];

                    if (revealed[surroundi][surroundj] == 0) {
                        var cell = findCell(surroundi, surroundj);

                        var highlightColour = "#70a4ff"

                        cell.style.backgroundColor = highlightColour;
                        cell.querySelector('.hexTop').style.borderBottomColor = highlightColour;
                        cell.querySelector('.hexBottom').style.borderTopColor = highlightColour;

                        

                    }
                });

                highlighted[0] = i;
                highlighted[1] = j;

            }
        }
    }
}

//fn to reveal remaining unfound mines in random order. Also puts X on wrong flags
revealMines = () => {

    //init arays to contain coords
    var minesUnfound = [];

    var wrongFlags = [];

    //interate through game board
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

    //fn that will reveal a random mine
    delayRevealMines = () => {
        
        //if length is not 0, i.e. there are still mines to reveal
        if (minesUnfound.length) {

            //generate random number for mine to display
            var rand = Math.floor(Math.random() * minesUnfound.length);

            //finds cell on page given i and j
            var cell = findCell(minesUnfound[rand][0], minesUnfound[rand][1]);
            
            //adds dot to cell
            cell.innerHTML += "&#9679";

            //removes coord from remaining unrevealed cells
            minesUnfound.splice(rand, 1);

            //calls fn again with 150ms delay
            setTimeout(delayRevealMines, 150);

        //if all mines are revealed skip to crossing flags
        } else {
            delayRevealFlags();
        }
    }

    //Flag reveal Fn
    delayRevealFlags = () => {

        //if there are flags to reveal
        if (wrongFlags.length) {

            //generate rand number for flag to reveal
            var rand = Math.floor(Math.random() * wrongFlags.length);

            //finds cell in page
            var cell = findCell(wrongFlags[rand][0], wrongFlags[rand][1]);

            //creates X element
            var newX = document.createElement('div');

            //adds styling
            newX.classList.add('flagcross');

            //Adds to page
            cell.appendChild(newX);

            //removes self from coords array
            wrongFlags.splice(rand, 1);

            //call fn again recursively
            setTimeout(delayRevealFlags, 150);

        }

        if(wonGame){alert("You Won!")}

    }

    delayRevealMines();

}

//fn to get surrounding cells given i j value
getSurround = (i, j) => {

    i = Number(i);
    j = Number(j);

    var output = [];

    //determines reletive index number of above/below row before 
    var offsetMin = (i + margin + 1) % 2;

    //determines relative index number of above/below cell after
    var offsetPlus = (i + margin) % 2;
    if (gameBoard[i][j] != null) {
        //if not at edge
        if (j - 1 >= 0) {
            if (gameBoard[i][j - 1] != null) { output.push([i, j - 1]) }
        }
        if (j + 1 <= gameBoard.length - 1) {
            if (gameBoard[i][j + 1] != null) { output.push([i, j + 1]); }
        }
        if (i - 1 >= 0) {
            if (j - offsetMin >= 0) {

                if (gameBoard[i - 1][j - offsetMin] != null) { output.push([i - 1, j - offsetMin]); }

            }

            if (j + offsetPlus <= gameBoard.length - 1) {

                if (gameBoard[i - 1][j + offsetPlus] != null) { output.push([i - 1, j + offsetPlus]); }

            }
        }
        if (i + 1 <= gameBoard.length - 1) {
            if (j - offsetMin >= 0) {

                if (gameBoard[i + 1][j - offsetMin] != null) { output.push([i + 1, j - offsetMin]); }

            }

            if (j + offsetPlus <= gameBoard.length - 1) {

                if (gameBoard[i + 1][j + offsetPlus] != null) { output.push([i + 1, j + offsetPlus]); }

            }
        }
    }

    return output;

}

//fn to find cell elements on page given i j
findCell = (i, j) => {
    
    //init return var
    var cellToReturn;

    //finds all hexes on page
    document.querySelectorAll(".hexagon").forEach(cell => {

        //if cell is the one being looked for
        if(cell.dataset.indexi == i && cell.dataset.indexj == j){

            //get ready to return
            cellToReturn = cell;
        }
    });

    //return cell
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

    //attach keydown listner to page
    document.addEventListener("keydown", e => {

        if (e.key == "Control") {
            //change tracker to true on keydown
            ctrDown = true;
            if(lastCtrDown != ctrDown){
                highlightRevealSurround();
            }
            lastCtrDown = true;
        }

        
    })

    //attach keyup listner to page
    document.addEventListener("keyup", e => {

        if (e.key == "Control") {
            //change tracker to false on keyup
            ctrDown = false;
            lastCtrDown = false;
            highlightRevealSurround();
        }
    })



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