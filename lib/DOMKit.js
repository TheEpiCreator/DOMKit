/**
 * A collection of tools for representing HTML tags as Javascript objects.
 */
class TagLegacy {

    /**
     * @typedef ChildArray
     * @type {Array}
     * @property {String} [textContent] Text input (ex. ["this is a string", ...] => <tag>this is a string</tag>)
     * @property {HTMLElement} [property] A reference to an HTML element (usually a tag)
     */

    /**
     * Creates an HTML tag which can be referenced in JS
     * @param {String} type The type of tag to be created ("p" => <p>, "a" => <a>, "ul" => <ul>, "div" => <div>, etc.)
     * @param {Object} [attributes] An object containing the attributes and their values (ex. {id:"thisIsAnID"} means <tag id="thisIsAnID"> will be created)
     * @param {HTMLElement} [parent] A reference to the HTML element under which the tag should be appended
     * @param {ChildArray} [children] An array containing references to HTML objects or String objects that should be appended as a child
     */
    constructor(type, attributes, parent, children) {
        console.warn('You are using a legacy method. This may result in bugs.')
        //store input
        this._type = type
        this._attributes = attributes
        this._parent = parent
        this._children = children

        //create element
        this._tag = document.createElement(this._type)

        //only execute if attributes are defined
        if (this._attributes) {
            //format attribute object
            let attributeArray = Object.entries(this._attributes)

            //loop through and set attributes
            for (var i = 0; i < attributeArray.length; i++) {
                //set attributes
                this._tag.setAttribute(attributeArray[i][0], attributeArray[i][1])
            }
        }

        if (!this._parent) {
            //set parent to body
            this._parent = document.body
        }
        //set as child of parent object
        this._parent.appendChild(this._tag)

        //only execute if children are defined
        if (children) {
            //loops through all children elements
            children.forEach(element => {
                //switch based on whether children are defined as array of pointers or pointer or string
                if (typeof element === "string") { //child should be String
                    //append Textified string to tag
                    this._tag.appendChild(document.createTextNode(element))
                } else { //child should be HTMLElement
                    this._tag.appendChild(element)
                }
            })
        }
        return this
    }

    /**
     * Adds attributes to the tag. If an attribute already exists, it is overriden.
     * @param {String[]} attributes The attributes to add to the tag
     */
    set attributes(attributes) {
        //store type before change for comparison
        let attributesOld = this._attributes
        //redefine type
        this._attributes = attributes
        //check if new type is different to avoid unnecesary performance drops
        if (this._attributes !== attributesOld) {
            //loop through and set attributes
            for (const [key, value] of Object.entries(this._attributes)) {
                //set attributes
                this._tag.setAttribute(key, value)
            }
        }
    }

    set parent(parent) {
        //store type before change for comparison
        let parentOld = this._parent
        //redefine type
        this._parent = parent
        //check if new type is different to avoid unnecesary performance drops
        if (this._parent !== parentOld) {
            parent.append(this.tag)
        }
    }

    set children(children) {
        //store type before change for comparison
        let childrenOld = this._children
        //redefine type
        this._children = children
        //check if new type is different to avoid unnecesary performance drops
        if (this._children !== childrenOld) {
            //create temporary pointer to new tag
            let newTag = new Tag(this.type, this.attributes, this.parent, this._children)
            //destroy old tag
            this.remove()
            //set permanent tag pointer to new tag
            this._tag = newTag.tag
        }
    }

    set type(type) {
        //store type before change for comparison
        let typeOld = this._type
        //redefine type
        this._type = type
        //check if new type is different to avoid unnecesary performance drops
        if (this._type !== typeOld) {
            //create temporary pointer to new tag
            let newTag = new Tag(this._type, this.attributes, this.parent, this.children)
            //destroy old tag
            this.remove()
            //set permanent tag pointer to new tag
            this._tag = newTag.tag
        }
    }

    set tag(tag) {
        this._tag = tag
    }

    get type() {
        //update type | get tag name
        this._type = this.tag.tagName.toLowerCase()
        return this._type
    }

    get attributes() {
        //update attributes | create variable to store new attributes
        let newAttributes = {}
        //create variable to store tag attributes
        let oldAttributes = this.tag.attributes
        //loop through tag.attributes
        for (var i = 0; i < this.tag.attributes.length; i++) {
            //add attributes to newAttributes object
            newAttributes[oldAttributes[i].nodeName] = this.tag.getAttribute(oldAttributes[i].nodeName)
        }
        this._attributes = newAttributes
        return this._attributes
    }

    get parent() {
        this._parent = this.tag.parentNode
        if (!this._parent) this.parent = document.body
        return this._parent
    }

    get children() {
        //update attributes | create variable to store new attributes
        let childrenArray = []
        //create variable to store tag attributes
        let children = this.tag.childNodes
        //loop through tag.attributes
        for (var i = 0; i < children.length; i++) {
            //add attributes to newAttributes object
            childrenArray[i] = children[i]
        }
        this._children = childrenArray
        return this._children
    }

    /**
     * Gets the children of the [tag]'s parents, excluding [tag]
     */
    get relatives() {
        //use same method as children getter to set relatives
        let relativeArray = []
        let relatives = this.parent.children

        for (var i = 0; i < relatives.length; i++) {
            //exclude self
            if (relatives[i] !== this.tag) {
                relativeArray[i] = relatives[i]
            }
        }

        this._relatives = relativeArray
        return this._relatives
    }

    get tag() {
        return this._tag
    }

    /**
     * Reorders the tag's relatives so that the tag is in [position] position.
     * @param {Number|"first"|"last"} position The position in which to place the tag
     */
    toPosition(position) {
        //create fragment
        let fragment = document.createDocumentFragment()
        //create list of relatives
        let relativeList = this.relatives
        //test if position was "first" or "last"
        switch (position) {
            case "first":
                relativeList.splice(0, 0, this.tag)
                break
            case "last":
                relativeList.push(this.tag)
                break
            default:
                //splice tag into array at position
                relativeList.splice(position, 0, this.tag)
                break
        }

        for (let item of relativeList) {
            fragment.appendChild(item)
        }
        //use internal parent, using real parent when updating order causes error
        this._parent.appendChild(fragment)
    }

    /**
     * Removes the tag
     */
    remove() {
        this._tag.remove()
        this._tag = null
    }

    /**
     * Deletes current tag in favor of referencing an existing tag
     * @param {HTMLElement} tag the tag to reference
     */
    reference(tag) {
        this.remove()
        this.tag = tag
    }
}

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