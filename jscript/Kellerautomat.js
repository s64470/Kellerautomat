/**
 * Projektaufgabe P2: Grammatik und Kellerautomat
 *
 * Aufgabenstellung: Erzeugen Sie mit Hilfe eine Grammatik zufällige arithmetische Ausdrücke über den natürlichen
 * Zahlen mit den Operanden "+, -, *, /" und beliebig geschachtelten runden Klammeren, z.B.: 2 * (3 * (4 + 7) - 9).
 * Es sollte auch möglich sein einen fehlerhaften Ausdruck zu erzeugen. Prüfen Sie dann die erzeugten Ausdrücke
 * mittels eines Kellerautomaten.
 *
 * Visualisierung: Die Generierung der Ausdrücke mittels der Grammatik wird schrittweise angezeigt. Der Kellerautomaten
 * soll als Tabelle und als Graph dargestellt werden. Die Verarbeitung der Eingabe durch den Automaten kann schrittweise
 * nachvollzogen werden. Schließlich wird das Endzustand und das Ergebnis (erkannt oder nicht erkannt) des Automaten
 * dargestellt.
 *
 * Interaktion: Man kann in der Anwendung richtige und falsche Beispiel als Eingabe erzeugen lassen. Auch die Eingabe
 * eines Ausdrucks von Hand ist möglich. Die Eingabe kann schrittweise oder automatisch animiert verarbeitet werden.
 * Die Animationsgeschwindigkeit ist einstellbar.
 */

"use strict";

/* Initialize Foundation 6 Framework */
$(document).ready(function() {
	$(document).foundation();

	/* Reload browser application/window */
	$('#restart').on('click', function() {
		location.reload();
	});

	/* Start the simulation */
	$('#run').on('click', function() {
		let intervalSpeed;
		let inputStr = $('#inputTextfield').val();
		$('#input').append(inputStr);											// Poject textfield value to html document

		// Check which radio button is checked
		if ($('#slow').is(':checked')) {
			intervalSpeed = 5000;
			console.info('Speed timer: ' + (intervalSpeed / 1000) + ' sec.');
		} else if ($('#fast').is(':checked')) {
			intervalSpeed = 1000;
			console.info('Speed timer: ' + (intervalSpeed / 1000) + ' sec.');
		}

		if ($.trim($('#inputTextfield').val()) != '') {							// Check non empty textfield
			var expression = $('#inputTextfield').val() + '#';					// Get expression from textfield to sign the end of an expression add char '#'
			start(expression, intervalSpeed);									// Call function start simulation
		} else {																// If textbox is empty -> change textbox background color
			let errorMessage = 'Fehler: Bitte Ausdruck eingeben!';
			$('#inputTextfield').css('background-color', 'rgb(255, 221, 163)');
			$('#inputTextfield').val(errorMessage);

			/* Change background color to init mode (wait three second) -> Background Color: white */
			setInterval(function() {
				$('#inputTextfield').val('');									// Clear textbox
				$('#inputTextfield').css('background-color', 'rgb(255, 255, 255)');
			}, 3000);
		}

		$('#inputTextfield').focus();											// Set cursor to textbox
	});

	// Set selected value to inputbox
	$('#selector').on('click', function() {
		var selector = $('#selector').val();
		$('#inputTextfield').val(selector);
	});

	/* Select a wrong random expression */
	var randExpression = [
		'((8+9)',
		'7*(3+9',
		'(',
		')',
		'((((9+2)/8)/2)',
		'((87 + 19) - (41 / 17 + 58'
	];

	$('#_rand').on('click', function() {
		// Set randomly generated value to textbox
		$('#inputTextfield').val(randExpression[Math.floor(Math.random() * randExpression.length)]);
	});

	$('#random').on('click', function() {
		/**
		 * Generate mathematical expressions
		 */

		// Build tree e.g.
		//		*
		//	   / \
		//	  2   +
		//		 / \
		//		6	2
		class TreeNode {
			constructor(left, right, operator) {
				this.left = left;
				this.right = right;
				this.operator = operator;

				this.toString = function() {
					return '(' + left + ' ' + operator + ' ' + right + ')';
				};
			}
		}

		function randomNumberRange(min, max) {
			return Math.floor(Math.random() * (max - min) + min);
		}

		var x = ['/', '*', '-', '+'];

		// Recursive function to build trees
		function buildTree(numNodes) {
			if (numNodes === 1)
				return randomNumberRange(1, 100);

			var numLeft = Math.floor(numNodes / 2);
			var leftSubTree = buildTree(numLeft);
			var numRight = Math.ceil(numNodes / 2);
			var rightSubTree = buildTree(numRight);
			var m = randomNumberRange(0, x.length);
			var str = x[m];
			return new TreeNode(leftSubTree, rightSubTree, str);
		}

		var input = 'level 5';										// Can be changed from Level 1 to Level x, depending on the lenght of the mathematical expression
		input = input.split(' ');
		var n = Number(input[1]);
		$('#inputTextfield').val(buildTree(n).toString());			// Set expression to textbox
	});

	// Toggle Help (Button), on default: display: none;
	$('#help').on('click', function() {
		var element = document.getElementById('showUserHelp');
		element.classList.toggle('showUserHelp');
	});

	var stack = [];				// Initialize an empty stack
	var newExpressionStr;

	function start(expression, intervalSpeed) {
		(async () => {
			let state = 0;			// Empty state
			console.log('Length of textfield: ' + expression.length);

			// Remove all numerics incl. [+, -, *, /], except '(' or ')'
			for (let index = 0; index < expression.length; index++) {
				newExpressionStr = expression.replaceAll(/[/\+ \- \* \// \d+]/g, '');
			}

			console.info('Stored value :' + newExpressionStr);
			stack.push('#');		// Set bottom of stack

			var timer = 200;

			// Validate expression -> pushdown automaton
			for (let i = 0; i < newExpressionStr.length; i++) {
				if (state === 0) {
					// Erste Eingabesymbol '(' und gelesenes Kellerzeichen auf Position[0] = '#',
					// kein Zustandswechsel, Zustand: s0
					if (newExpressionStr[i] === '(' && stack[stack.length - 1] === '#') {
						state = 0;														// Zustand: s0
						stack.push(newExpressionStr[i]);								// Push: '('
						$('#s0').removeClass('stateColor').addClass('stateChange');		// Change color on state: s0
						// Wait a specific amount of time
						await new Promise((resolve) => setTimeout(resolve, intervalSpeed));
						$('#s0').removeClass('stateChange').addClass('stateColor');		// Change color on state: s0
					}
					// Zweites, drittes, viertes, [usw.] Eingabesymbol '(' und vorheriges Kellerzeichen
					// auf Position[n-1] = '(', kein Zustandswechsel, Zustand: s0
					else if (newExpressionStr[i] === '(' && stack[stack.length - 1] === '(') {
						state = 0;														// Zustand: s0
						stack.push(newExpressionStr[i]);								// Push: '('
						$('#s0').removeClass('stateChange').addClass('stateColor');		// Change color on state: s0  ==|
						// Wait a specific amount of time																|
						await new Promise((resolve) => setTimeout(resolve, timer));									//	|
						$('#s0').removeClass('stateColor').addClass('stateChange');		// Change color on state: s0	| Animation: Blink effect
						// Wait a specific amount of time																|
						await new Promise((resolve) => setTimeout(resolve, intervalSpeed));							//	|
						$('#s0').removeClass('stateChange').addClass('stateColor');		// Change color on state: s0  ==|
					}
					// Erstes Eingabesymbol ')' und oberstes Kellerzeichen '(',
					// oberstes Kellerzeichen löschen, Zustandswechsel auf s1
					else if (newExpressionStr[i] === ')' && stack[stack.length - 1] === '(') {
						state = 1;														// Zustand: s1
						stack.pop();													// Pop: ')'
					}
					// Erstes Eingabesymbol ')' und oberstes Kellerzeichen '#',
					// kein Zustandswechsel, throw: error
					else if (newExpressionStr[i] === ')' && stack[stack.length - 1] === '#') {
						state = 0;

						var popup = new Foundation.Reveal($('#popup-modal'));
						//console.log('Closing ) whitout any opening ( are not allowed');
						//window.alert('Closing ) whitout any opening ( are not allowed.');
						popup.open();
						// Disable buttons: simulate, random
						$('#run').prop('disabled', true);
						$('#random').prop('disabled', true);
						$('#_rand').prop('disabled', true);
						break;
					}
					// Fehler: Ungleiches Paar an Klammerungen
					else if (newExpressionStr[i] === '#' && stack[stack.length - 1] === '(') {
						let htmlText = '<b>Wort nicht akzeptiert &ensp; &#10060;</b>';
						//debugger;
						$('#status').append(htmlText).css('color', '#d91e63');
						$('#s0').removeClass('stateColor').addClass('stateError');
						/* Disable simulate and random button */
						$('#run').prop('disabled', true);
						$('#random').prop('disabled', true);
						$('#_rand').prop('disabled', true);
					}
					// Eingabesymbol enthält keine '(', gelesenes Kellerzeichen auf Position[n-1] = '#'
					// Zustandswechsel auf s2
					else {
						state = 2;
						//debugger;

						let htmlText = '<b>Wort akzeptiert &ensp; &check;</b>';
						let htmlResult = $('#input').text();
						$('#status').append(htmlText).css('color', '#4aa153');
						$('#result').append(eval(htmlResult));
						/* Disable simulate and random button */
						$('#run').prop('disabled', true);
						$('#random').prop('disabled', true);
						$('#_rand').prop('disabled', true);
					}

					continue;
				} else if (state === 1) {
					$('#s1').removeClass('stateColor').addClass('stateChange');			// Change color on state: s1
					//debugger;

					if (newExpressionStr[i] === ')' && stack[stack.length - 1] === '(') {
						state = 1;
						stack.pop();
						$('#s1').removeClass('stateChange').addClass('stateColor');		// Change color on state: s1  ==|
						// Wait a specific amount of time																|
						await new Promise((resolve) => setTimeout(resolve, timer));									//	|
						$('#s1').removeClass('stateColor').addClass('stateChange');		// Change color on state: s1	| Animation: Blink effect
						// Wait a specific amount of time																|
						await new Promise((resolve) => setTimeout(resolve, intervalSpeed));							//	|
						$('#s1').removeClass('stateChange').addClass('stateColor');		// Change color on state: s1  ==|
					} else if (newExpressionStr[i] === '#' && stack[stack.length - 1] === '#') {
						state = 2;
						//debugger;
						$('#s1').removeClass('stateChange').addClass('stateColor');		// Change color on state: s1
						$('#s2').removeClass('stateColor').addClass('stateChange');		// Change color on state: s2

						let htmlText = '<b>Wort akzeptiert &ensp; &check;</b>';
						let htmlResult = $('#input').text();
						$('#status').append(htmlText).css('color', '#4aa153');
						$('#result').append(eval(htmlResult));
						/* Disable simulate and random button */
						$('#run').prop('disabled', true);
						$('#random').prop('disabled', true);
						$('#_rand').prop('disabled', true);
					}
					// Transition: s1 > s0
					else if (newExpressionStr[i] === '(' && stack[stack.length - 1] === '(') {
						state = 0;														// Zustand: s0
						//debugger;
						stack.push(newExpressionStr[i]);								// Push: '('
						$('#s1').removeClass('stateChange').addClass('stateColor');		// Change color on state: s1  ==|
						// Wait a specific amount of time																|
						await new Promise((resolve) => setTimeout(resolve, timer));									//	|
						$('#s1').removeClass('stateColor').addClass('stateChange');		// Change color on state: s1	| Animation: Blink effect
						// Wait a specific amount of time																|
						await new Promise((resolve) => setTimeout(resolve, intervalSpeed));							//	|
						$('#s1').removeClass('stateChange').addClass('stateColor');		// Change color on state: s1  ==|
					}
					// Fehler: Ungleiches Paar an Klammerungen
					else if (newExpressionStr[i] === '#' && stack[stack.length - 1] === '(') {
						let htmlText = '<b>Wort nicht akzeptiert &ensp; &#10060;</b>';
						$('#status').append(htmlText).css('color', '#d91e63');
						$('#s1').removeClass('stateColor').addClass('stateError');
						/* Disable simulate and random button */
						$('#run').prop('disabled', true);
						$('#random').prop('disabled', true);
						$('#_rand').prop('disabled', true);
					}

					continue;
				} // end case 1
				// Endzustand, wenn andere Zustände erreicht sind, d.h. Zustand = 2, throw: Wort akzeptiert
				else {
					console.log('Endzustand erreicht, keine weitere Eingabe möglich');
					/* Disable simulate and random button */
					$('#run').prop('disabled', true);
					$('#random').prop('disabled', true);
					$('#_rand').prop('disabled', true);
				}
			} // end for ();
		})(); // end async ();
	}
});