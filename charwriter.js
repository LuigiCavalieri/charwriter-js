/**
 * CharWriter 1.0
 * 
 * A class to insert, delete and replace text into an HTML tag 
 * by animating the task in a typing-like fashion.
 * 
 * Copyright 2022 Luigi Cavalieri, https://luigicavalieri.com
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 * 
 * ********************************************************************** */

class CharWriter {
	#index         = 0;
	#timeoutHandle = null;

	constructor( elemID ) {
		if ( typeof elemID != 'string' ) {
			throw "Invalid ID attribute supplied.";
		}

		const element = document.getElementById( elemID );
	
		if ( typeof element !== 'object' ) {
			throw "Invalid DOM element.";
		}
		
		if ( element.firstChild && 3 != element.firstChild.nodeType ) {
			throw "Cannot handle nested DOM elements.";
		}
		
		this.target = element;
	}
	
	/**
	 * Computes a random animation pace given a range of values.
	 *
	 * @param {integer} min
	 * @param {integer} max
	 * @return {integer}
	 */
	#pace( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
	}

	/**
	 * Executes a callback after an optional delay.
	 *
	 * @param {function} callback
	 * @param {integer} delay Optional number of milliseconds the execution of the callback should be delayed of.
	 */
	#maybeExecuteCallback( callback, delay ) {
		this.#timeoutHandle = null;

		if ( typeof callback !== 'function' ) {
			return null;
		}
			
		if ( delay > 0 ) {
			setTimeout( callback, delay );
		}
		else {
			callback();
		}
	}
	
	/**
	 * Types into the target node.
	 *
	 * @param {string} text
	 * @param {function} callback Optional. A function to call once the animation is over.
	 * @param {integer} delay Optional number of milliseconds the execution of the callback should be delayed of.
	 */
	type( text, callback = null, delay = 0 ) {
		if ( typeof text === 'string' ) {
			text = text.split( '' );
		}

		if ( 0 === text.length ) {
			return null;
		}

		const current_char = text[this.#index++];
	
		this.target.textContent += current_char;
	
		if ( this.#index < text.length  ) {
			let pace        = 0;
			const next_char = text[this.#index];
			
			// The first occurrence of an uppercase char is typed slower.
			if ( /[A-Z]/.test( next_char ) && /[^A-Z]/.test( current_char ) ) {
				pace = this.#pace( 100, 250 );
			}
			else if ( /[.,;a-z0-9]/.test( next_char  ) ) {
				pace = this.#pace( 50, 120 );
			}
			else {
				pace = this.#pace( 100, 300 );
			}

			this.#timeoutHandle = setTimeout( () => this.type( text, callback, delay ), pace );
		}
		else {
			this.#index = 0;
			this.#maybeExecuteCallback( callback, delay );
		}		
	}
	
	/**
	 * Deletes the content of the target node.
	 *
	 * @param {function} callback Optional function to call once the animation is over.
	 * @param {integer} delay Optional number of milliseconds the execution of the callback should be delayed of.
	 */
	 delete( callback = null, delay = 0 ) {
		this.target.textContent = this.target.textContent.substring( 0, this.target.textContent.length - 1 );
	
		if ( this.target.textContent.length ) {
			this.#timeoutHandle = setTimeout( () => this.delete( callback, delay ), this.#pace( 30, 70 ) );
		}
		else {
			this.#maybeExecuteCallback( callback, delay );
		}
	}

	/**
	 * Replaces the content of the target node with the value of 'text'.
	 *
	 * @param {string} text
	 */
	overtype( text ) {
		this.delete( () => this.type( text ), 500 );
	}

	/**
	 * Stops the currently running animation.
	 *
	 * @param {integer} haltDelay Optional number of milliseconds after which the method must be executed.
	 * @param {function} callback Optional function to call once the current animation has been stopped.
	 */
	 stop( haltDelay = 0, callback = null ) {
		if ( haltDelay > 0 ) {
			setTimeout( () => this.stop( 0, callback ), haltDelay );

			return null;
		}

		if ( typeof this.#timeoutHandle === 'number' ) {
			clearTimeout( this.#timeoutHandle );
			this.#maybeExecuteCallback( callback, 0 );
		}
	}
}