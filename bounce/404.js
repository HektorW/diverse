(function() {
	if (window['404Game'] !== 'bounce') return;


	var Events = (function() {
		'use strict';
		var slice = Array.prototype.slice;
		var Events = {
			on: function(event, callback, context) {
				if (!event || !callback) return this;
				if (!this._events) this._events = {};
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
		wall: null,

		gravity: new Vec2(0, 0.982),

		saved: 0,
		dropped: 0,

		spawner: {
			lastSpawned: 0,
			delayMin: 0.8,
			delayMax: 3.5
		},

		bubbleMinSpeed: 125,
		bubbleMaxSpeed: 200,

		mouse: {
			x: 0,
			y: 0
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

			this.wall = new Rect(0, 50, 75, 550, '#333', 'fill');
			this.paddle = new Paddle(this);

			this.lastTime = Time.getTime();
			this.update();
		},


		update: function() {
			raf(this.update);

			var time = Time.getTime(this.lastTime);

			this.updateScene(time);

			this.draw(time);

			this.postUpdate(time);
		},

		updateScene: function(time) {
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
				this.spawner.delayMax = Math.max(this.spawner.delayMin, this.spawner.delayMax - 0.1);

				this.bubbleMinSpeed++;
				this.bubbleMaxSpeed+=2;
			}


			this.paddle.update(time);

			this.checkCollisions(time);
		},

		
		postUpdate: function(time) {
			this.lastTime = time;
		},


		draw: function(time) {
			var ctx = this.ctx;

			ctx.fillStyle = '#f2f2f2';
			ctx.fillRect(0, 0, this.width, this.height);


			for (var i = this.bubbles.length; i--; )
				this.bubbles[i].draw(ctx);


			this.wall.draw(ctx);
			this.paddle.draw(ctx);

			ctx.strokeText("Saved: " + this.saved, this.width / 2, 10);
			ctx.strokeText("Dropped: " + this.dropped, this.width / 2, 30);
		},



		checkCollisions: function(time) {
			var rect = this.paddle.getRect();


			// Paddle => Bubble
			for (var i = this.bubbles.length; i--; ) {
				var bubble = this.bubbles[i];

				// if (Collisions.circleInRect(bubble, rect)) {
				if (Collisions.rectInRect(bubble.getRect(), rect)) {

					if (bubble.y < rect.y + rect.height / 2) {
						bubble.trigger('bounce', bubble);
					}
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

			bubble.on('fall', this.bubbleFall);
			bubble.on('goal', this.bubbleGoal);

			this.bubbles.push(bubble);
		},


		bubbleGoal: function(bubble) {
			this.saved++;
		},
		bubbleFall: function(bubble) {
			this.dropped++;
		}
	};



	var Collisions = {
		rectInRect: function(a, b) {
			return a.x < b.x + b.width &&
				   a.x + a.width > b.x &&
				   a.y < b.y + b.height &&
				   a.y + a.height > b.y;
		},
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
		var rect = this.rect;
		
		rect.x = this.game.mouse.x - this.rect.width / 2;

		// Contain paddle within bounds
		var wall = this.game.wall;
		if (rect.x < wall.x + wall.width) {
			rect.x = wall.x + wall.width;
		}
		if (rect.x + rect.width > this.game.width) {
			rect.x = this.game.width - rect.width;
		}
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

		// https://mrbubblewand.files.wordpress.com/2010/04/darkness_002.png
		this.animation = new Animation().load('https://mrbubblewand.files.wordpress.com/2009/09/magic_003.png', 5, 5);

		this.on('bounce', function() {
			this.vel.y *= -1;
		}, this);
	}

	Bubble.prototype.spawn = function() {
		this.alive = true;

		
		var launchAngle = randRange(-1.35, -0.2);
		this.vel = new Vec2(Math.cos(launchAngle), Math.sin(launchAngle));
		this.velSpeed = randRange(this.game.bubbleMinSpeed, this.game.bubbleMaxSpeed);


		this.x = 0;
		this.y = 200;

		this.velY = randRange(50, 200);
		this.xVelTimeOffset = randRange(0, Math.PI);
		this.xVelDistOffset = randRange(1, 4);
		this.xVelSpeed = randRange(0.0007, 0.003);

		this.radius = randRange(10, 25);
	};

	Bubble.prototype.update = function(time) {

		this.vel = Vec2.add(this.vel,
						Vec2.mulVal(this.game.gravity, time.elapsedMs)
					);

		this.x += this.vel.x * time.elapsedMs * this.velSpeed;
		this.y += this.vel.y * time.elapsedMs * this.velSpeed;

		if (this.x > this.game.width) {
			this.alive = false;
			this.trigger('goal', this);
		} else if (this.y > this.game.height) {
			this.alive = false;
			this.trigger('fall', this);
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

	Bubble.prototype.getRect = function() {
		return {
			x: this.x - this.radius,
			y: this.y - this.radius,
			width: this.radius * 2,
			height: this.radius * 2
		};
	};
	extend(Bubble.prototype, Events);




	////////////////
	// Animation //
	////////////////
	function Animation() {
		this.spritesheet = null;
		this.loaded = false;
		this.xCount = 0;
		this.yCount = 0;

		this.width = 0;
		this.height = 0;

		this.currentIndex = 0;
		this.delay = 0.2;
	}
	Animation.prototype.setup = function() {
		animation.width = this.spritesheet.width / this.xCount;
		animation.height = this.spritesheet.height / this.yCount;
	};
	Animation.prototype.load = function(url, xCount, yCount) {
		var animation = this;

		var img = this.spritesheet = new Image();

		this.spritesheet.onload = function() {
			animation.loaded = true;
			animation.setup();
		};
		this.spritesheet.onerror = function() {};

		this.spritesheet.src = url;

		return this;
	};
	Animation.prototype.update = function(time) {};
	Animation.prototype.draw = function(ctx, x, y, width, height) {
		ctx.save();

		var sx = Math.floor(this.spritesheet.width % (this.width * this.currentIndex));
		var sy = Math.floor(this.spritesheet.width / (this.width * this.currentIndex));

		ctx.drawImage(this.spritesheet, sx, sy, this.width, this.height, x, y, width, height);

		ctx.restore();
	};



	//////////
	// Vec2 //
	//////////
	function Vec2(x, y) {
		this.x = x;
		this.y = y;
	}
	Vec2.clone = function(v) {
		return new Vec2(v.x, v.y);
	};
	Vec2.add = function(v, u) {
		return new Vec2(u.x + v.x, u.y + v.y);
	};
	Vec2.sub = function(v, u) {
		return new Vec2(u.x - v.x, u.y - v.y);
	};
	Vec2.mul = function(v, u) {
		return new Vec2(u.x * v.x, u.y * v.y);
	};
	Vec2.div = function(v, u) {
		return new Vec2(u.x / v.x, u.y / v.y);
	};
	Vec2.mulVal = function(v, e) {
		return new Vec2(v.x * e, v.y * e);
	};



	Game.init();
	window.Game = Game;
}());