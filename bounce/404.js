(function() {
	if (window['404Game'] !== 'bounce') return;


	var Events = (function() {
		'use strict';
		var slice = Array.prototype.slice;
		var Events = {
			on: function(event, callback, context) {
				if (!event || !callback) return this;
				this._events || (this._events = {});
				(this._events[event] || (this._events[event] = [])).unshift({ callback: callback, _context: context, ctx: context || this });
				return this;
			},
			once: function(event, callback, context) {
				this.on(event, function fn() { this.off(event, fn, context); callback.apply(this, arguments); }, context);
			},
			off: function(event, callback, context) {
				var i, events, ev;
				if (!this._events) return this;
				if (!event) { this._events = {}; return this; }
				events = this._events[event] || [];
				for (i = events.length; i--;) {
					ev = events[i];
					if (callback == ev.callback && (!context || context == ev._context)) events.splice(i, 1);
				}
				if (!events.length) delete this._events[event];
				return this;
			},
			trigger: function(event) {
				if (!event || !this._events) return this;
				var args = slice.call(arguments, 1);
				var events = this._events[event];
				if (events) _triggerEvents(events, args);
				return this;
			}
		};
		function _triggerEvents(events, args) {
			var i, ev;
			for (i = events.length; i--;) (ev = events[i]).callback.apply(ev.ctx, args);
		}
		return Events;
	}());



	///////////
	// Util //
	///////////
	var raf = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.msRequestAnimationFrame;

	var Time = {
		now: (function() {
			var p = performance || {};
			p.now = p.now || function() { return (new Date()).getTime(); };
			return function() {
				return p.now();
			};
		}()),
		
		getTime: function(lastTime) {
			var time = {
				now: Time.now()
			};

			lastTime = lastTime || time;

			time.elapsedMs = (time.now - lastTime.now) / 1000.0;
			time.lastNow = lastTime.now;

			return time;
		}
	};

	var TWOPIE = Math.PI * 2;

	function randRange(min, max) {
		return min + (Math.random() * Math.abs(max-min));
	}
	function extend(target) {
		for (var i = 0; i < arguments.length; i++) {
			var source = arguments[i];
			for (var key in source) {
				if (!source.hasOwnProperty(key)) continue;
				target[key] = source[key];
			}
		}
		return target;
	}
	function bindAll(target) {
		for (var fn in target) {
			if (typeof target[fn] !== 'function' || !target.hasOwnProperty(fn)) continue;
			target[fn] = target[fn].bind(target);
		}
		return target;
	}


	var Game = {
		lastTime: null,
		canvas: null,
		ctx: null,

		bubbles: [],
		paddle: null,

		spawner: {
			lastSpawned: 0,
			delayMin: 0.2,
			delayMax: 1.5
		},

		mouse: {
			x: 0,
			y: 0
		},


		wall: {
			x: 0,
			y: 200,
			width: 200,
			height: 400
		},



		init: function() {
			// Bind
			bindAll(this);

			this.initDOM();
			this.initEvents();

			this.start();
		},


		initDOM: function() {
			this.$element = $('#game');

			this.canvas = $('<canvas>')[0];
			this.ctx = this.canvas.getContext('2d');

			this.width = this.canvas.width = 800;
			this.height = this.canvas.height = 600;

			$(this.canvas).css({
				margin: '100px auto',
				display: 'block',
				boxShadow: '0 5px 10px #333'
			});

			this.$element.append(this.canvas);
		},


		initEvents: function() {
			$(window).on('mousemove', this.mouseMove);
		},


		start: function() {
			this.bubbles = [];
			this.spawner.lastSpawned = 0;

			this.paddle = new Paddle(this);

			this.lastTime = Time.getTime();
			this.update();
		},


		update: function() {
			raf(this.update);

			var time = Time.getTime(this.lastTime);


			for (var i = this.bubbles.length; i--; ) {
				var bubble = this.bubbles[i];

				bubble.update(time);

				if (!bubble.alive) {
					this.bubbles.splice(i, 1);
				}
			}


			// Spawn new bubbles
			this.spawner.lastSpawned -= time.elapsedMs;
			while (this.spawner.lastSpawned <= 0.0) {
				this.spawnBubble();

				this.spawner.lastSpawned += randRange(this.spawner.delayMin, this.spawner.delayMax);
				this.spawner.delayMax = Math.max(this.spawner.delayMin, this.spawner.delayMax - 0.01);
			}


			this.paddle.update(time);


			this.checkCollisions(time);

			this.draw();

			this.lastTime = time;
		},

		draw: function() {
			var ctx = this.ctx;

			ctx.fillStyle = '#f2f2f2';
			ctx.fillRect(0, 0, this.width, this.height);


			for (var i = this.bubbles.length; i--; )
				this.bubbles[i].draw(ctx);


			this.paddle.draw(ctx);
		},



		checkCollisions: function(time) {
			var rect = this.paddle.getRect();

			for (var i = this.bubbles.length; i--; ) {
				var bubble = this.bubbles[i];

				if (Collisions.circleInRect(bubble, rect)) {
					bubble.trigger('hit', bubble);
				}
			}
		},





		mouseMove: function(event) {
			var offset = $(this.canvas).offset();

			this.mouse.x = event.pageX - offset.left;
			this.mouse.y = event.pageY - offset.top;
		},

		spawnBubble: function() {
			var bubble = new Bubble(this);

			bubble.on('hit.bottom', this.bubbleHitBottom);

			this.bubbles.push(bubble);
		}
	};



	var Collisions = {
		circleInRect: function(circle, rect) {
			return Collisions.pointInRect(circle, rect);
		},
		pointInRect: function(point, rect) {
			return point.x > rect.x &&
				   point.y > rect.y &&
				   point.x < rect.x + rect.width &&
				   point.y < rect.y + rect.y;
		}
	};


	///////////
	// Rect //
	///////////
	function Rect(x, y, width, height, color, style) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.color = color || null;
		this.style = style || 'stroke';
	}
	Rect.prototype.draw = function(ctx) {
		ctx.save();

		if (this.color) {
			ctx[this.style + 'Style'] = this.color;
		}

		ctx[this.style + 'Rect'](this.x, this.y, this.width, this.height);

		ctx.restore();
	};



	/////////////
	// Paddle //
	/////////////
	function Paddle(game) {
		this.game = game;

		var width = 140;
		var height = 20;

		this.rect = new Rect(
			game.width / 2 - width / 2,
			game.height - 40,
			width,
			height,
			'#333',
			'stroke'
		);
	}

	Paddle.prototype.update = function(time) {
		this.x = this.game.mouse.x;
	};

	Paddle.prototype.draw = function(ctx) {
		this.rect.draw(ctx);
	};

	Paddle.prototype.getRect = function() {
		return this.rect;
	};
	extend(Paddle.prototype, Events);




	/////////////
	// Bubble //
	/////////////
	function Bubble(game) {
		this.game = game;
		this.spawn();

		this.on('hit', function() {
			this.alive = false;
		}, this);
	}

	Bubble.prototype.spawn = function() {
		this.alive = true;

		this.x = randRange(40, this.game.width - 40);
		this.y = randRange(-40, -10);

		this.velY = randRange(50, 200);
		this.xVelTimeOffset = randRange(0, Math.PI);
		this.xVelDistOffset = randRange(1, 4);
		this.xVelSpeed = randRange(0.0007, 0.003);

		this.radius = randRange(10, 25);
	};

	Bubble.prototype.update = function(time) {

		this.y += this.velY * time.elapsedMs;
		this.x += Math.cos(time.now * this.xVelSpeed * this.xVelTimeOffset) * this.xVelDistOffset;

		if (this.y > this.game.height) {
			this.alive = false;
		}
	};

	Bubble.prototype.draw = function(ctx) {
		ctx.save();

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, TWOPIE, false);
		ctx.strokeStyle = '#333';
		ctx.stroke();

		ctx.restore();	
	};
	extend(Bubble.prototype, Events);


	Game.init();
	window.Game = Game;
}());