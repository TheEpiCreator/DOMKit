/**
 * A collection of tools for representing HTML tags as Javascript objects.
 */

class Tag {

    /**
     * Creates an HTML element which can be referenced using the generated object
     * @param {String} [id] The ID of the element, if none is given a new element will be created.
     * @param {Boolean} [debug] Whether to output debug messages.
     */
    constructor(id, debug) {
        /* All possible tag attributes:
        Name/Type (string)
        Attributes (object value==string)
        Location in hierarchy (Parent, order)
        Contents (Tag objects or normal HTMLElements)

        Proposed behaviors on destruction:
        create new object when attribute is set
        */
        // Set debug mode, default to false if not defined
        this.debug = debug || false
        // Use existing element
        if (typeof id === 'string') this.element = document.getElementById(id)
        //  Create div element
        else this.element = document.createElement('div')

        // Create state storage
        this.stored = {}

        if (this.debug) console.log('Created object')
    }

    // This is where the real fun begins

    /**
     * If the element is deleted, recreate it
     */
    fix() {
        // check if element exists
        if (!this.element) {
            // create element
            this.element = document.createElement(this.stored.name || 'div')
            if (this.debug) console.warn('Had to recreate element, some pointers may no longer work')
        }
    }

    /**
     * Sets the name of the element
     * @param {String} name The new name of the element
     */
    set name(name) {
        // fix
        this.fix()
        // check for correct input
        if (typeof name === 'string') {
            // rename using element.outerHTML TODO: make sure doing this doesn't erase any pointers
            this.element.outerHTML = this.element.outerHTML.replace(new RegExp(this.element.name, 'g'), name)
            // Store new name
            this.stored.name = name
        } else if (this.debug) console.warn('Unexpected input')
    }

    /**
     * Sets the name of the element.
     * @param {String} name The new name of the element
     * @returns reference to Tag object, useful for method chaining
     */
    setName(name) {
        this.name = name
        return this
    }

    /**
     * Sets the parent of the element.
     * @param {(Tag|HTMLElement)} parent The new parent of the element
     */
    set parent(parent) {
        // fix
        this.fix()
        // check for correct input & make sure you aren't trying to parent element to itself
        if (parent instanceof Tag && parent.element !== this.element) parent.element.appendChild(this.element)
        else if (parent instanceof HTMLElement && parent !== this.element) parent.appendChild(this.element)
        else if (this.debug) console.warn('Unexpected input')
    }

    /**
     * Sets the parent of the element.
     * @param {(Tag|HTMLElement)} parent The new parent of the element
     * @returns reference to Tag object, useful for method chaining
     */
    setParent(parent) {
        this.parent = parent
        return this
    }
}