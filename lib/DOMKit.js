/**
 * A collection of tools for representing HTML tags as Javascript objects.
 */

//  Just add export before class to use this as a module
class Tag {

    /**
     * Creates an HTML element which can be referenced using the generated object
     * @param {HTMLElement|String} [element] If defined, use existing element. If a string is given, uses it as element's ID.
     * @param {Boolean} [debug=false] Whether to output debug messages
     */
    constructor(element, debug) {
        /* All possible tag attributes:
        Name/Type (string) DONE
        Attributes (object value==string) DONE
        Location in hierarchy (Parent, order)
        Contents (Tag objects or normal HTMLElements) DONE

        Proposed behaviors on destruction:
        create new object when attribute is set
        */
        // Set debug mode, default to false if not defined
        this.debug = debug || false
        // Use existing element
        if (element instanceof HTMLElement) this.element = element
        else if (typeof id === 'string') this.element = document.getElementById(element) || document.createElement('div')
        //  Create div element
        else this.element = document.createElement('div')

        // Create state storage
        this.stored = {}

        if (this.debug) console.log('Created object')
    }

    // This is where the real fun begins

    /**
     * @returns {String} the name of the element
     */
    get name() {
        return this.element.name
    }

    /**
     * @returns {String} the name of the element
     */
    getName() {
        return this.name
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
            // Stolen from stackoverflow: https://stackoverflow.com/a/15086834

            let newTag = document.createElement(name)

            // Copy the children
            while (this.element.firstChild) newTag.appendChild(this.element.firstChild) // *Moves* the child

            // Copy the attributes
            for (let index = this.element.attributes.length - 1; index >= 0; index--) {
                newTag.attributes.setNamedItem(this.element.attributes[index].cloneNode())
            }

            // Replace it
            if (this.element.parentElement) this.element.parentElement.replaceChild(newTag, this.element)
            else this.element.remove()

            this.element = newTag

            // Store new name
            this.stored.name = name
        } else this.uxp()
    }

    /**
     * Sets the name of the element.
     * @param {String} name The new name of the element
     * @returns {Tag} reference to Tag object, useful for method chaining
     */
    setName(name) {
        this.name = name
        return this
    }

    /**
     * @returns {Tag} The tag's parent
     */
    get parent() {
        return new Tag(this.element.parentElement)
    }

    /**
     * @returns {Tag} The tag's parent
     */
    getParent() {
        return this.parent
    }

    /**
     * Sets the parent of the element.
     * @param {(Tag|HTMLElement)} [parent] The new parent of the element. If the parent is not defined, the element will be deparented.
     */
    set parent(parent) {
        // fix
        this.fix()
        // check for correct input & make sure you aren't trying to parent element to itself
        if (parent instanceof Tag && parent.element !== this.element) {
            parent.element.appendChild(this.element)
            this.stored.parent = parent
        } else if (parent instanceof HTMLElement && parent !== this.element) {
            parent.appendChild(this.element)
            this.stored.parent = new Tag(parent)
        } else if (!parent) {
            this.parent.removeChild(this.element)
            this.stored.parent = null
            if (this.debug) console.log('Parent is undefined, deparenting element')
        } else this.uxp()
    }

    /**
     * Sets the parent of the element.
     * @param {(Tag|HTMLElement)} [parent] The new parent of the element
     * @returns {Tag} reference to Tag object, useful for method chaining
     */
    setParent(parent) {
        this.parent = parent
        return this
    }

    /**
     * @returns {Tag[]} the tag's content
     */
    get content() {
        let content = []
        // loop through all content
        for (let item of this.element.childNodes) content.push(new Tag(item))
        return content
    }

    /**
     * @returns {Tag[]} the tag's content
     */
    getContent() {
        return this.content
    }

    /**
     * Sets the contents of the tag.
     * Protip: You can use array operations on contents (ex. tag.contents.push(newContent), tag.contents.splice(2, 1, newContent))
     * @param {(Tag|HTMLElement|String)[]} content The new contents of the tag
     */
    set content(content) {
        // fix
        this.fix()
        // check for correct input
        if (Array.isArray(content)) {
            // set content
            this.stored.contentOld = []
            this.stored.content = []
            // Loop through all old content and remove
            for (let item of this.content) this.stored.contentOld.push(this.element.removeChild(item))
            // Loop through all new content and append
            for (let item of content) {
                switch (typeof item) {
                    case 'string':
                        // Create text node
                        const text = document.createTextNode(item)
                        // Append text node to document
                        this.element.appendChild(text)
                        this.stored.content.push(new Tag(text))
                        break
                    case 'object':
                        if (item instanceof Tag) {
                            // set parent of tag to this tag
                            item.parent = this
                            this.stored.content.push(item)
                        } else if (item instanceof HTMLElement) {
                            // append element to this tag
                            this.element.appendChild(item)
                            this.stored.content.push(new Tag(item))
                        } else this.uxp(item)
                        break
                    default:
                        this.uxp(item)
                }
            }
        } else this.uxp(content)
    }

    /**
     * Sets the contents of the tag.
     * @param {((Tag|HTMLElement|String)[]|Tag|HTMLElement|String)} contents The new contents of the tag
     * @returns {Tag} reference to Tag object, useful for method chaining
     */
    setContent(content) {
        this.content = content
        return this
    }

    get attributes() {
        // Define output
        let out = {}
        // Restructure iterator into object
        for(item of this.element.attributes) {
            out[item.name] = item.value
        }
        return out
    }

    getAttributes() {
        return this.attributes
    }

    set attributes(attributes) {
        // fix
        this.fix()
        // Check for correct input
        if (typeof attributes === 'object' && attributes) {
            // Delete all unnecesary attributes
            for (const [key, value] of Object.entries(this.attributes)) if (!attributes[key]) this.element.removeAttribute(key)
            // Loop through and add all attributes
            for(const [key, value] of Object.entries(attributes)) this.element.setAttribute(key, value)
            this.stored.attributes = attributes
        } else this.uxp()
    }

    setAttributes(attributes) {
        this.attributes = attributes
        return this
    }

    // Generic functions

    /**
     * If the element is deleted, recreate it
     * @returns {Tag} reference to Tag object, useful for method chaining
     */
    fix() {
        // check if element exists
        if (!this.element) {
            // create element
            this.element = document.createElement(this.stored.name || 'div')
            if (this.debug) console.warn('Had to recreate element, some pointers may no longer work')
        }
        return this
    }

    /**
     * Sets whether debug info will print to console
     * @param {Boolean} [debug=false] Whether to log debug messages 
     * @returns {Tag} reference to Tag object, useful for method chaining
     */
    debug(debug) {
        // Set debug mode, default to false if not defined
        this.debug = debug || false
        return this
    }

    /**
     * For internal use only, logs "Unexpected input" if debug mode is on
     */
    uxp(item) {
        if (this.debug) {
            console.warn(`Unexpected input: ${item}`)
            console.trace()
        }
    }

    // Alternative functions (insead of tag.parent = parent, you can do tag.setParent(parent))
}