//select all needed elements
var numberButtons = Array.from(document.getElementsByClassName('number'));
var operatorButtons = Array.from(document.getElementsByClassName('operator'));
var equalsButton = document.getElementsByClassName('equals')[0];
var clearButton = document.getElementsByClassName('clear')[0];
var decimalButton = document.getElementsByClassName('decimal')[0];
var deleteButton = document.getElementsByClassName('delete')[0];
var display = document.getElementById('display');
var displayText = document.getElementById('display-text');
//calculate text width on screen (accounting for scaling and font/font size)
function getTextWidth(text) {
    var canvas = document.getElementsByName('canvas').length > 0 ?
        document.getElementsByName('canvas')[0] :
        document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = '15px Rubik';
    return context.measureText(text).width * 2.5;
}
//define Operator enum
var Operator;
(function (Operator) {
    Operator["ADD"] = "+";
    Operator["SUBTRACT"] = "-";
    Operator["MULTIPLY"] = "x";
    Operator["DIVIDE"] = "\u00F7";
    Operator["POWER"] = "x<sup>y</sup>";
    Operator["RADICAL"] = "\u221A";
    Operator["UNDEFINED"] = "";
})(Operator || (Operator = {}));
/*code for when the display is full*/
function FullDisplay() {
    operatorButtons.forEach(function (element) { return element.classList.add("disabled"); });
    numberButtons.forEach(function (element) { return element.classList.add("disabled"); });
    clearButton.classList.add('awaiting');
    new Audio('audio/error.wav').play();
}
/* reset to normal*/
function ResetDisplay() {
    operatorButtons.forEach(function (element) { return element.classList.remove("disabled"); });
    numberButtons.forEach(function (element) { return element.classList.remove("disabled"); });
    clearButton.classList.remove('awaiting');
}
//define variables
var firstNumber = '0';
var secondNumber = '0';
var operator = Operator.UNDEFINED;
var maxWidth = 15;
//add event listeners for numbers
numberButtons.forEach(function (element) {
    element.addEventListener('click', function () {
        if (clearButton.classList.contains('awaiting'))
            return;
        new Audio('audio/click.wav').play();
        var number = element.innerHTML;
        if (operator == Operator.UNDEFINED) {
            if (firstNumber.length + secondNumber.length > maxWidth) {
                FullDisplay();
                return;
            }
            if (firstNumber === '0')
                firstNumber = number;
            else
                firstNumber += number;
            displayText.innerHTML = firstNumber;
        }
        else if (operator == Operator.RADICAL) {
            if (firstNumber.length + secondNumber.length > maxWidth) {
                FullDisplay();
                return;
            }
            firstNumber == '0' ? firstNumber = number : firstNumber += number;
            displayText.innerHTML = operator + firstNumber;
        }
        else {
            if (firstNumber.length + secondNumber.length > maxWidth) {
                FullDisplay();
                return;
            }
            secondNumber == '0' ? secondNumber = number : secondNumber += number;
            if (operator == Operator.POWER)
                displayText.children[0].innerHTML = secondNumber;
            else
                displayText.innerHTML += number;
        }
    });
});
//add event listeners for operators
operatorButtons.forEach(function (element) {
    element.addEventListener('click', function () {
        if (firstNumber.length + secondNumber.length > maxWidth) {
            FullDisplay();
            return;
        }
        else
            new Audio('audio/click.wav').play();
        if (operator != Operator.UNDEFINED)
            return;
        operator = element.innerHTML;
        if (operator == Operator.POWER) {
            displayText.innerHTML += "<sup>";
            displayText.children[0].innerHTML = "0";
        }
        else if (operator == Operator.RADICAL) {
            displayText.innerHTML = element.innerHTML + displayText.innerHTML;
        }
        else
            displayText.innerHTML += element.innerHTML;
    });
});
operatorButtons.forEach(function (element) {
    element.addEventListener('mouseover', function () {
        if (clearButton.classList.contains('awaiting')) {
            new Audio('audio/shake.wav').play();
        }
    });
});
numberButtons.forEach(function (element) {
    element.addEventListener('mouseover', function () {
        if (clearButton.classList.contains('awaiting')) {
            new Audio('audio/error2.mp3').play();
        }
    });
});
//add event listeners for equals and clear
equalsButton.addEventListener('click', function () {
    new Audio('audio/click.wav').play();
    if (firstNumber.length == 0 || secondNumber.length == 0 || operator == Operator.UNDEFINED)
        return;
    var result = 0;
    switch (operator) {
        case Operator.ADD:
            result = parseFloat(firstNumber) + parseFloat(secondNumber);
            break;
        case Operator.SUBTRACT:
            result = parseFloat(firstNumber) - parseFloat(secondNumber);
            break;
        case Operator.MULTIPLY:
            result = parseFloat(firstNumber) * parseFloat(secondNumber);
            break;
        case Operator.DIVIDE:
            result = parseFloat(firstNumber) / parseFloat(secondNumber);
            break;
        case Operator.POWER:
            result = Math.pow(parseFloat(firstNumber), parseFloat(secondNumber));
            break;
        case Operator.RADICAL:
            result = Math.sqrt(parseFloat(firstNumber));
            break;
    }
    if (result.toString().includes('.')) {
        result = Math.round(result * 100000) / 100000;
    }
    displayText.innerHTML = result.toString();
    firstNumber = result.toString();
    secondNumber = '0';
    operator = Operator.UNDEFINED;
    ResetDisplay();
});
clearButton.addEventListener('click', function () {
    firstNumber = '0';
    secondNumber = '0';
    operator = Operator.UNDEFINED;
    displayText.innerHTML = '0';
    ResetDisplay();
    new Audio('audio/click.wav').play();
});
deleteButton.addEventListener('click', function () {
    if (operator == Operator.POWER) {
        if (secondNumber != '0') {
            console.log("here");
            secondNumber = secondNumber.slice(0, -1);
            if (secondNumber.length == 0)
                secondNumber = '0';
            displayText.children[0].innerHTML = secondNumber;
            return;
        }
        else {
            operator = Operator.UNDEFINED;
            displayText.children[0].remove();
            return;
        }
    }
    if (displayText.innerHTML == "Infinity" || displayText.innerHTML == "NaN")
        return;
    if (displayText.innerHTML.length > 1) {
        displayText.innerHTML = displayText.innerHTML.slice(0, -1);
        if (operator === Operator.UNDEFINED)
            firstNumber = firstNumber.slice(0, -1);
        else
            secondNumber = secondNumber.slice(0, -1);
    }
    else {
        displayText.innerHTML = '0';
        if (operator === Operator.UNDEFINED)
            firstNumber = '0';
        else
            secondNumber = '0';
    }
    if (displayText.innerHTML.slice(-1) != Operator.UNDEFINED) {
        operator = Operator.UNDEFINED;
    }
    ResetDisplay();
    new Audio('audio/click.wav').play();
});
decimalButton.addEventListener('click', function () {
    if (operator == Operator.UNDEFINED || operator == Operator.RADICAL) {
        if (firstNumber.includes('.'))
            return;
        else
            firstNumber += '.';
        displayText.innerHTML += '.';
    }
    else if (operator == Operator.POWER) {
        if (displayText.children[0].innerHTML.includes('.'))
            return;
        else
            secondNumber += '.';
        displayText.children[0].innerHTML += ".";
    }
    else {
        if (secondNumber.includes('.'))
            return;
        else
            secondNumber += '.';
        displayText.innerHTML += '.';
    }
    new Audio('audio/click.wav').play();
});
