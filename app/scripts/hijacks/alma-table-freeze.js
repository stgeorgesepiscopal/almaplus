YUI.add('alma-table-freeze', function (Y) {

    function TableFreeze(table, opts) {
        this.table = table;
        this.opts = opts;

        this.events = [];
        this.ghostScroller = null;
        this.container = this.table.get('parentNode');
        this.isScrolling = false;
        this.skipNextGhostScrollEvent = false;
        this.scrollingTimer = null;
        this.headerTickLeft = null;
        this.headerTickRight = null;
        this.columnTickTop = null;
        this.reset();
    }

    /**
     * attach event listeners
     */
    TableFreeze.prototype.bind = function () {
        // setup a ghost scroller so bottom scroll bar is always visible for those that care (I'm looking at you, windows users)
        this.ghostScroller = Y.Node.create('<div class="ghost-scroller-wrapper"></div>');
        this.ghostScroller.setStyles({
            width: this.container.get('region').width,
            overflowX: 'scroll',
            overflowY: 'hidden',
            position: 'fixed',
            bottom: 0,
            height: '24px',
            zIndex: 1
        });
        this.ghostScroller.append('<div class="ghost-scroller" style="width:' + this.container.one('table').get('offsetWidth') + 'px;height:10px"></div>');
        this.container.insert(this.ghostScroller, 'after');

        // handle the body scroll
        this.events.push(Y.on('scroll', Y.bind(function () {

            // calculate the top transform position for the fixed columns
            this.columnTickTop = -this.container.get('docScrollY') + this.container.getY();

            // check the header to see if sticky should be enabled
            this.setStickyHeader();

            // smooth out the actions as best we can
            this.getTick();
        }, this)));

        // handle the containers horizontal scroll
        this.events.push(this.container.on('scroll', function (evt) {
            // calculate the clip and transform needed on scroll
            this.headerTickLeft = this.container.get('scrollLeft');
            this.headerTickRight = this.frozenHeader.get('region').width - this.container.get('region').width - this.headerTickLeft;

            // match the ghost scroller with container scroller
            this.skipNextGhostScrollEvent = true;
            this.ghostScroller.getDOMNode().scrollLeft = this.headerTickLeft;

            // keep it smooth
            this.getTick();
        }, this));

        // handle the ghost scroller action
        this.events.push(this.ghostScroller.on('scroll', function (evt) {
            if (!this.skipNextGhostScrollEvent) {
                // match the container scroller with the ghost scroller
                this.container.getDOMNode().scrollLeft = this.ghostScroller.get('scrollLeft');
            }
            this.skipNextGhostScrollEvent = false;
        }, this));

        // on resizes reset the tables
        this.events.push(Y.on('windowresize', Y.bind(function (evt) {
            this.reset();
        }, this)));

        // catch the scrolling event to apply flags as needed
        this.events.push(Y.on(['mousewheel', 'DOMMouseScroll'], Y.bind(this.onMouseWheel, this)));

        // reset the tables when the nav effects page sizes
        this.events.push(Y.Global.on('alma:nav-toggle', function (evt) {
            this.reset();
        }, this));
    };

    /**
     * detach all event listeners
     */
    TableFreeze.prototype.unbind = function () {
        Y.Array.each(this.events, function (evt) {
            evt.detach();
        });
        this.events = [];

        if (this.ghostScroller) {
            this.ghostScroller.remove(true);
            this.ghostScroller = null;
        }
    };

    /**
     * checks page positions and enables sticky header as needed
     */
    TableFreeze.prototype.setStickyHeader = function () {
        if (!this.enabled) {
            return;
        }

        var isSticky = this.container.get('docScrollY') >= this.container.getY();
        this.frozenHeader.toggleClass('hidden', !isSticky);
        this.frozenCorner.toggleClass('hidden', !isSticky);
    };

    /**
     * checks page positions and shows / hides / sets the ghost scroller as needed
     */
    TableFreeze.prototype.setGhostScroller = function () {
        if (!this.enabled || !this.ghostScroller) {
            return;
        }
        var containerWidth = this.container.get('region').width,
            tableWidth = this.table.get('scrollWidth'),
            needsGhostScroller = tableWidth > containerWidth;

        this.ghostScroller.toggleClass('hidden', !needsGhostScroller);

        if(needsGhostScroller) {
            this.ghostScroller.setStyle('width', containerWidth);
            this.ghostScroller.one('.ghost-scroller').setStyle('width', tableWidth);
        }
    };

    /**
     * debounce the scroll using request animation frame
     *
     * @param {Boolean} matchSizes
     */
    TableFreeze.prototype.getTick = function (matchSizes) {
        if (!this.hasTick) {
            Y.config.win.requestAnimationFrame(Y.bind(function() {
                this.sync(matchSizes);
            }, this));
        }
        this.hasTick = true;
    };

    /**
     * enables the freeze effects
     *
     * @return {this}
     */
    TableFreeze.prototype.enable = function () {
        if (!this.enabled) {
            this.enabled = true;
            this.reset();
        }

        return this;
    };

    /**
     * disables the freeze effects
     *
     * @return {this}
     */
    TableFreeze.prototype.disable = function () {
        if (this.enabled) {
            this.enabled = false;
            this.reset();
        }

        return this;
    };

    /**
     * reset the freeze elements, setting positions and styles
     *
     * @return {this}
     */
    TableFreeze.prototype.reset = function () {

        // clean any existing frozen nodes
        if (this.frozenNodes) {
            this.frozenNodes.remove(true);
        }
        if (this.enabled) {
            // prevent double down on bindings if somone is resizing a page or whatever
            if (this.events.length === 0) {
                this.bind();
            }

            // stamp each cell for easier clone ref
            this.table.all('th,td').each(function (cell) {
                cell.setAttribute('data-id', Y.guid());
            });

            // clone our master table for the header
            this.frozenHeader = this.container.cloneNode(true).addClass('frozen frozen-header').setAttribute('aria-hidden', 'true');
            // remove any cruft carried over as part of the clone
            this.frozenHeader.all('tr:not(.freeze-row)').remove();
            // remove any extra dom that may have been part of the container
            this.frozenHeader.get('children').filter('*:not(table)').remove();
            this.frozenHeader.setStyles({
                zIndex: 1,
                position: 'fixed',
                overflow: 'visible',
                top: 0,
                left: this.container.getX()
            });
            this.frozenHeader.addClass('hidden');

            // clone our master table for the columns
            this.frozenColumn = this.container.cloneNode(true).addClass('frozen frozen-column').setAttribute('aria-hidden', 'true');
            // remove any cruft carried over as part of the clone
            this.frozenColumn.all('th:not(.freeze-column),td:not(.freeze-column)').remove();
            // remove any extra dom that may have been part of the container
            this.frozenColumn.get('children').filter('*:not(table)').remove();
            this.frozenColumn.setStyles({
                zIndex: 1,
                position: 'fixed',
                overflow: 'hidden',
                top: 0
            });

            // clone our master table for the corner
            this.frozenCorner = this.frozenColumn.cloneNode(true).replaceClass('frozen-column', 'frozen-corner');

            // remove all the extra cruft
            this.frozenCorner.all('tr:not(.freeze-row)').remove();
            this.frozenCorner.setStyles({
                zIndex: 1,
                position: 'fixed',
                overflow: 'hidden',
                top: 0
            });
            this.frozenCorner.addClass('hidden');

            // keep track of our frozen nodes
            this.frozenNodes = Y.all([this.frozenColumn, this.frozenHeader, this.frozenCorner]);

            // adjust the ghost scroller sizes
            this.setGhostScroller();

            // enable horizontal container scroll
            this.container.setStyles({
                overflowX: 'scroll',
                overflowY: 'hidden',
                paddingBottom: '24px'
            });

            // insert the new frozen nodes into the page
            this.container.insert(this.frozenNodes, 'after');

            // check if we need to render with sticky headers
            this.setStickyHeader();

            // kick off the sync
            this.sync(true);
        } else {
            this.container.setStyles({ maxHeight: null, overflow: null });
            this.unbind();
        }

        return this;
    };

    /**
     * fixes cloned table cells to the size of the source table
     *
     * @param {Node} source
     * @param {Node} target
     */
    TableFreeze.prototype.matchCellSizes = function (source, target) {
        target.all('th,td').each(function (cell) {
            var s = source.one('[data-id="' + cell.getAttribute('data-id') + '"]'),
                d = s.getDOMNode().getBoundingClientRect();
            cell.setStyles({ boxSizing: 'border-box', height: d.height, width: d.width, minWidth: d.width, maxWidth: d.width });
        });
    };

    /**
     * synchronizes the frozen tables with the source table
     *
     * @param {Boolean} matchSizes
     *
     * @return {this}
     */
    TableFreeze.prototype.sync = function (matchSizes) {
        if (!this.enabled) {
            return this;
        }

        // if sizes are being matched, fix column sizes and find new positions based on any page adjustments
        if (matchSizes) {
            this.frozenNodes.each(Y.bind(this.matchCellSizes, this, this.table));
            this.columnTickTop = -this.container.get('docScrollY') + this.container.getY();
            this.headerTickLeft = this.container.get('scrollLeft');
            this.headerTickRight = this.frozenHeader.get('region').width - this.container.get('region').width - this.headerTickLeft;
        }

        var freezeColumn = this.frozenColumn.get('children').size(),
            freezeHeader = this.frozenHeader.get('children').size();

        // translate the frozen column in the Y direction based on last known location
        if (freezeColumn) {
            this.frozenColumn.setStyles({
                /* Fix for blurry text, as suggested here // https://medium.com/@glaubermagal/fixing-weird-blurry-when-using-position-absolute-and-transform-translate-no-matter-percent-or-8885631ec088 */
                transform: 'translateY(' + parseInt(this.columnTickTop) + 'px)'
            });
        }

        // translate the frozen header in the X direction based on last known location
        // clip out any overflow, clip is deprecated, but IE sucks, so I have both clip-path and clip
        if (freezeHeader) {
            this.frozenHeader.setStyles({
                transform: 'translateX(' + -this.headerTickLeft + 'px)',
                clip: 'rect(0px ' + (this.container.get('offsetWidth') + this.headerTickLeft) + 'px ' + this.container.get('offsetHeight') + 'px 0px)',
                '-webkitClipPath': 'inset(0px ' + this.headerTickRight + 'px ' + -this.container.get('offsetHeight') + 'px ' + this.headerTickLeft + 'px)',
                clipPath: 'inset(0px ' + this.headerTickRight + 'px ' + -this.container.get('offsetHeight') + 'px ' + this.headerTickLeft + 'px)'
            });
        }

        if (matchSizes) {
            // force repaint
            this.frozenColumn.setStyle('display', 'none');
            this.frozenColumn.get('offsetHeight');
            this.frozenColumn.setStyle('display', '');
        }

        // let our animation handler know we've processed our tick
        this.hasTick = false;

        return this;
    };

    /**
     * watches for scroll events and applies a class and flag
     *
     * @param {EventFacade} evt
     */
    TableFreeze.prototype.onMouseWheel = function (evt) {
        if (this.scrollingTimer) {
            this.scrollingTimer.cancel();
            this.scrollingTimer = null;
        }
        if (!this.isScrolling) {
            this.onScrollStart();
        }
        this.scrollingTimer = Y.later(100, this, this.onScrollStop);
    };

    /**
     * applies flag and class for scrolling events
     */
    TableFreeze.prototype.onScrollStart = function () {
        this.isScrolling = true;
        this.frozenNodes.addClass('scrolling');
    };

    /**
     * removes flag and class for scrolling events
     */
    TableFreeze.prototype.onScrollStop = function () {
        this.isScrolling = false;
        this.frozenNodes.removeClass('scrolling');
    };

    return Y.namespace('Alma').TableFreeze = TableFreeze;

}, '1.0.0', { requires: ['node-style', 'node-screen', 'node-event-delegate', 'event-resize'] });
