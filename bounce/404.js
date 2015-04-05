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

	function randItem (list) { return list[Math.floor(randRange(0, list.length))]; }
	function randRange (min, max) { return min + (Math.random() * Math.abs(max-min)); }
	function lerp (a, b, t) { return a + t * (b - a); }

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


	function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	  if (typeof stroke == "undefined" ) {
	    stroke = true;
	  }
	  if (typeof radius === "undefined") {
	    radius = 5;
	  }
	  ctx.beginPath();
	  ctx.moveTo(x + radius, y);
	  ctx.lineTo(x + width - radius, y);
	  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	  ctx.lineTo(x + width, y + height - radius);
	  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	  ctx.lineTo(x + radius, y + height);
	  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	  ctx.lineTo(x, y + radius);
	  ctx.quadraticCurveTo(x, y, x + radius, y);
	  ctx.closePath();
	  if (stroke) {
	    ctx.stroke();
	  }
	  if (fill) {
	    ctx.fill();
	  }        
	}




	var Game = {
		lastTime: null,
		canvas: null,
		ctx: null,

		particles: [],
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


		fireworks: [],



		init: function() {
			// Bind
			bindAll(this);

			this.initDOM();
			this.initEvents();
			this.initFireworks();

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

		initFireworks: function() {
			this.fireworks.push(
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_004.png',
					xCount: 5,
					yCount: 4,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_005.png',
					xCount: 5,
					yCount: 4,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_006.png',
					xCount: 5,
					yCount: 6,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_007.png',
					xCount: 5,
					yCount: 5,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_008.png',
					xCount: 5,
					yCount: 10,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_010.png',
					xCount: 5,
					yCount: 8,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_009.png',
					xCount: 5,
					yCount: 8,
					width: 150,
					height: 150
				}),
				new Animation({
					url: 'https://mrbubblewand.files.wordpress.com/2010/07/effect_011.png',
					xCount: 5,
					yCount: 5,
					width: 150,
					height: 150
				})
			);
			
		},


		start: function() {
			this.bubbles = [];
			this.spawner.lastSpawned = 0;

			this.wall = new Rect(0, 50, 75, 600, '#111', '#FF851B');
			this.paddle = new Paddle(this);

			// https://mrbubblewand.files.wordpress.com/2010/04/darkness_002.png   5, 6
			// https://mrbubblewand.files.wordpress.com/2009/09/magic_003.png  5, 5
			this.animation = new Animation().load('https://mrbubblewand.files.wordpress.com/2010/04/darkness_002.png', 5, 6);
			// this.animation = new Animation({
			// 	url: 'https://mrbubblewand.files.wordpress.com/2010/01/wind_002.png',
			// 	xCount: 5,
			// 	yCount: 6
			// });

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

			for (i = this.particles.length; i--; )
				this.particles[i].update(time);

			this.paddle.update(time);

			// this.animation.update(time);

			this.checkCollisions(time);
		},

		
		postUpdate: function(time) {
			this.lastTime = time;
		},


		draw: function(time) {
			var ctx = this.ctx;

			// ctx.fillStyle = '#f2f2f2';
			ctx.fillStyle = '#111';
			ctx.fillRect(0, 0, this.width, this.height);


			for (i = this.particles.length; i--; )
				this.particles[i].draw(ctx);


			for (var i = this.bubbles.length; i--; )
				this.bubbles[i].draw(ctx);


			this.wall.draw(ctx);
			this.paddle.draw(ctx);

			ctx.strokeStyle = '#111';
			ctx.strokeText("Saved: " + this.saved, this.width / 2, 10);
			ctx.strokeText("Dropped: " + this.dropped, this.width / 2, 30);
			ctx.strokeStyle = '#fff';
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
			bubble.on('spawn', this.bubbleSpawn);
			bubble.on('bounce', this.bubbleBounce);

			this.bubbles.push(bubble);
		},


		bubbleSpawn: function(bubble) {
			var animation = new Animation({
					x: bubble.x - bubble.radius,
					y: bubble.y - bubble.radius,
					width: bubble.radius * 2,
					height: bubble.radius * 2,
					url: 'https://mrbubblewand.files.wordpress.com/2010/01/water_001.png',
					xCount: 5,
					yCount: 2,
					delay: 0.06,
					startIndex: 0
				})
				.on('end', this.removeParticle);

			this.particles.push(animation);
		},

		bubbleGoal: function(bubble) {
			this.saved++;

			var animation = new Animation(randItem(this.fireworks));
			animation.x = randRange(150, 450);
			animation.y = randRange(50, 300);

			animation.on('end', this.removeParticle);

			this.particles.push(animation);
		},
		bubbleFall: function(bubble) {
			this.dropped++;

			var animation = new Animation({
					x: bubble.x - 50,
					y: bubble.y - 85,
					width: 100,
					height: 100,
					url: 'https://mrbubblewand.files.wordpress.com/2010/04/darkness_002.png',
					xCount: 5,
					yCount: 6,
					delay: 0.06,
					startIndex: 3
				})
				.on('end', this.removeParticle);

			this.particles.push(animation);
		},
		bubbleBounce: function(bubble) {
			/*var animation = new Animation({
					x: bubble.x,
					y: this.paddle.rect.y - 20,
					width: bubble.radius,
					height: 18,
					url: 'https://mrbubblewand.files.wordpress.com/2011/11/heal_003.png',
					xCount: 5,
					yCount: 4,
					delay: 0.02,
					startIndex: 2,
					endIndex: 15
				})
				.on('end', this.removeParticle);

			this.particles.push(animation);*/
		},

		removeParticle: function(particle) {
			var index = this.particles.indexOf(particle);
			if (index != -1) {
				this.particles.splice(index, 1);
			}
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
	function Rect(x, y, width, height, fill, stroke, radius) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.radius = radius || null;

		this.fill = fill || null;
		this.stroke = stroke || null;

		if (!this.fill && !this.stroke) {
			this.stroke = 'black';
		}
	}
	Rect.prototype.draw = function(ctx) {
		ctx.save();

		ctx.strokeStyle = this.stroke;
		ctx.shadowBlur = 5;
		ctx.shadowColor = this.stroke;

		if (this.radius) {

			roundRect(ctx, this.x, this.y, this.width, this.height, this.radius, this.fill, this.stroke);

		} else {
			if (this.fill) {
				ctx.fillStyle = this.fill;
				ctx.fillRect(this.x, this.y, this.width, this.height);
			}

			if (this.stroke) {
				ctx.strokeStyle = this.stroke;
				ctx.strokeRect(this.x, this.y, this.width, this.height);
			}
		}

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
			false,
			'#FF4136',
			10
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
		ctx.save();

		// this.rect.draw(ctx);
		ctx.strokeStyle = this.rect.stroke;
		ctx.shadowBlur = 5;
		ctx.shadowColor = this.rect.stroke;
		this.rect.draw(ctx);

		ctx.restore();
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

		// this.animation = new Animation({
		// 	url: 'https://mrbubblewand.files.wordpress.com/2009/09/magic_003.png',
		// 	xCount: 5,
		// 	yCount: 5,
		// 	startIndex: 2,
		// 	endIndex: 14,
		// 	delay: randRange(0.055, 0.075)
		// });
		this.animation = new Animation({
			url: 'https://mrbubblewand.files.wordpress.com/2010/04/light_003.png',
			xCount: 5,
			yCount: 6,
			sourceOffset: 40,
			startIndex: 0,
			endIndex: 10,
			delay: randRange(0.055, 0.075)
		});
		
		
		var spawned = false;

		this.on('bounce', function() {
			this.vel.y = -Math.abs(this.vel.y * -1);
		}, this);
	}

	Bubble.prototype.spawn = function() {
		this.alive = true;

		
		var launchAngle = randRange(-1.35, -0.2);
		this.vel = new Vec2(Math.cos(launchAngle), Math.sin(launchAngle));
		this.velSpeed = randRange(this.game.bubbleMinSpeed, this.game.bubbleMaxSpeed);

		this.x = 0;
		this.y = 200;

		this.angle = randRange(0, TWOPIE);
		this.angleVel = randRange(0.5, TWOPIE);

		this.velY = randRange(50, 200);
		this.xVelTimeOffset = randRange(0, Math.PI);
		this.xVelDistOffset = randRange(1, 4);
		this.xVelSpeed = randRange(0.0007, 0.003);

		this.radius = randRange(10, 25);
	};

	Bubble.prototype.update = function(time) {

		this.animation.update(time);

		this.angle += this.angleVel * time.elapsedMs;

		this.vel = Vec2.add(this.vel,
						Vec2.mulVal(this.game.gravity, time.elapsedMs)
					);

		this.x += this.vel.x * time.elapsedMs * this.velSpeed;
		this.y += this.vel.y * time.elapsedMs * this.velSpeed;

		if (this.x > this.game.width) {
			this.alive = false;
			this.trigger('goal', this);
		} else if (this.y > this.game.height - 10) {
			this.alive = false;
			this.trigger('fall', this);
		} else if (this.x > this.game.wall.x + this.game.wall.width && !this.spawned) {
			this.spawned = true;
			this.trigger('spawn', this);
		}
	};

	Bubble.prototype.draw = function(ctx) {
		if (!this.alive) return;

		ctx.save();

		// ctx.beginPath();
		// ctx.arc(this.x, this.y, this.radius, 0, TWOPIE, false);
		// ctx.strokeStyle = '#333';
		// ctx.stroke();


		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);

		// this.animation.draw(ctx, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
		this.animation.draw(ctx, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

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
	function Animation(opt) {
		// Clone other Animation
		if (opt instanceof Animation) {
			extend(this, opt);

			if (this.loaded) {
				this.setup();
			} else {
				this.load(this.url);
			}

			return this;
		}

		opt = opt || {};
		this.loaded = false;

		this.spritesheet = opt.spritesheet || null;
		this.xCount = opt.xCount || 0;
		this.yCount = opt.yCount || 0;

		this.sourceOffset = opt.sourceOffset || null;

		this.x = opt.x || 0;
		this.y = opt.y || 0;
		this.width = opt.width || 0;
		this.height = opt.height || 0;

		this.endIndex = opt.endIndex || 0;
		this.startIndex = opt.startIndex || 0;
		this.currentIndex = this.startIndex;

		this.delay = opt.delay || 0.06;
		this.spriteTime = this.delay;

		if (opt.spritesheet) {
			this.setup();
		} else if (opt.url) {
			this.load(opt.url);
		}
	}
	Animation.prototype.setup = function() {
		this.loaded = true;
		this.spriteWidth = this.spritesheet.width / this.xCount;
		this.spriteHeight = this.spritesheet.height / this.yCount;

		this.endIndex = this.endIndex || this.xCount * this.yCount;
		this.currentIndex = this.startIndex;
		this.spriteTime = this.delay;

		this.trigger('load', this);
	};
	Animation.prototype.load = function(url) {
		var animation = this;

		this.url = url;

		var img = this.spritesheet = new Image();

		this.spritesheet.onload = function() {
			animation.setup();
		};
		this.spritesheet.onerror = function() {
			animation.trigger('error', animation);
		};

		this.spritesheet.src = url;

		return this;
	};
	Animation.prototype.update = function(time) {
		if (!this.loaded) return;

		this.spriteTime -= time.elapsedMs;
		while (this.spriteTime <= 0.0) {

			if (++this.currentIndex >= this.endIndex) {
				this.trigger('end', this);
				this.currentIndex = this.startIndex;
			}

			this.spriteTime += this.delay;
		}
	};
	Animation.prototype.draw = function(ctx, x, y, width, height) {
		// ctx.save();

		// Only ctx sent in, use own values
		if (arguments.length === 1) {
			x = this.x;
			y = this.y;
			width = this.width;
			height = this.height;
		}

		if (this.loaded) {
			var sw = this.spriteWidth;
			var sh = this.spriteHeight;
			var sx = Math.floor((sw * this.currentIndex) % this.spritesheet.width);
			var sy = Math.floor((sw * this.currentIndex) / this.spritesheet.width) * sh;

			if (this.sourceOffset) {
				sx += this.sourceOffset;
				sy += this.sourceOffset;
				sw -= this.sourceOffset * 2;
				sh -= this.sourceOffset * 2;
			}

			ctx.drawImage(this.spritesheet, sx, sy, sw, sh, x, y, width, height);
			
			// ctx.strokeStyle = 'green';
			// ctx.strokeRect(x, y, width, height);
		}
	};

	extend(Animation.prototype, Events);





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