var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
if (typeof Object.getPrototypeOf !== "function")
{
	if (typeof "test".__proto__ === "object")
	{
		Object.getPrototypeOf = function(object) {
			return object.__proto__;
		};
	}
	else
	{
		Object.getPrototypeOf = function(object) {
			return object.constructor.prototype;
		};
	}
}
(function(){
	cr.logexport = function (msg)
	{
		if (window.console && window.console.log)
			window.console.log(msg);
	};
	cr.seal = function(x)
	{
		return x;
	};
	cr.freeze = function(x)
	{
		return x;
	};
	cr.is_undefined = function (x)
	{
		return typeof x === "undefined";
	};
	cr.is_number = function (x)
	{
		return typeof x === "number";
	};
	cr.is_string = function (x)
	{
		return typeof x === "string";
	};
	cr.isPOT = function (x)
	{
		return x > 0 && ((x - 1) & x) === 0;
	};
	cr.abs = function (x)
	{
		return (x < 0 ? -x : x);
	};
	cr.max = function (a, b)
	{
		return (a > b ? a : b);
	};
	cr.min = function (a, b)
	{
		return (a < b ? a : b);
	};
	cr.PI = Math.PI;
	cr.round = function (x)
	{
		return (x + 0.5) | 0;
	};
	cr.floor = function (x)
	{
		return x | 0;
	};
	function Vector2(x, y)
	{
		this.x = x;
		this.y = y;
		cr.seal(this);
	};
	Vector2.prototype.offset = function (px, py)
	{
		this.x += px;
		this.y += py;
		return this;
	};
	Vector2.prototype.mul = function (px, py)
	{
		this.x *= px;
		this.y *= py;
		return this;
	};
	cr.vector2 = Vector2;
	cr.segments_intersect = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y)
	{
		if (cr.max(a1x, a2x) < cr.min(b1x, b2x)
		 || cr.min(a1x, a2x) > cr.max(b1x, b2x)
		 || cr.max(a1y, a2y) < cr.min(b1y, b2y)
		 || cr.min(a1y, a2y) > cr.max(b1y, b2y))
		{
			return false;
		}
		var dpx = b1x - a1x + b2x - a2x;
		var dpy = b1y - a1y + b2y - a2y;
		var qax = a2x - a1x;
		var qay = a2y - a1y;
		var qbx = b2x - b1x;
		var qby = b2y - b1y;
		var d = cr.abs(qay * qbx - qby * qax);
		var la = qbx * dpy - qby * dpx;
		var lb = qax * dpy - qay * dpx;
		return cr.abs(la) <= d && cr.abs(lb) <= d;
	};
	function Rect(left, top, right, bottom)
	{
		this.set(left, top, right, bottom);
		cr.seal(this);
	};
	Rect.prototype.set = function (left, top, right, bottom)
	{
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	};
	Rect.prototype.width = function ()
	{
		return this.right - this.left;
	};
	Rect.prototype.height = function ()
	{
		return this.bottom - this.top;
	};
	Rect.prototype.offset = function (px, py)
	{
		this.left += px;
		this.top += py;
		this.right += px;
		this.bottom += py;
		return this;
	};
	Rect.prototype.intersects_rect = function (rc)
	{
		return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom);
	};
	Rect.prototype.contains_pt = function (x, y)
	{
		return (x >= this.left && x <= this.right) && (y >= this.top && y <= this.bottom);
	};
	cr.rect = Rect;
	function Quad()
	{
		this.tlx = 0;
		this.tly = 0;
		this.trx = 0;
		this.try_ = 0;	// is a keyword otherwise!
		this.brx = 0;
		this.bry = 0;
		this.blx = 0;
		this.bly = 0;
		cr.seal(this);
	};
	Quad.prototype.set_from_rect = function (rc)
	{
		this.tlx = rc.left;
		this.tly = rc.top;
		this.trx = rc.right;
		this.try_ = rc.top;
		this.brx = rc.right;
		this.bry = rc.bottom;
		this.blx = rc.left;
		this.bly = rc.bottom;
	};
	Quad.prototype.set_from_rotated_rect = function (rc, a)
	{
		if (a === 0)
		{
			this.set_from_rect(rc);
		}
		else
		{
			var sin_a = Math.sin(a);
			var cos_a = Math.cos(a);
			var left_sin_a = rc.left * sin_a;
			var top_sin_a = rc.top * sin_a;
			var right_sin_a = rc.right * sin_a;
			var bottom_sin_a = rc.bottom * sin_a;
			var left_cos_a = rc.left * cos_a;
			var top_cos_a = rc.top * cos_a;
			var right_cos_a = rc.right * cos_a;
			var bottom_cos_a = rc.bottom * cos_a;
			this.tlx = left_cos_a - top_sin_a;
			this.tly = top_cos_a + left_sin_a;
			this.trx = right_cos_a - top_sin_a;
			this.try_ = top_cos_a + right_sin_a;
			this.brx = right_cos_a - bottom_sin_a;
			this.bry = bottom_cos_a + right_sin_a;
			this.blx = left_cos_a - bottom_sin_a;
			this.bly = bottom_cos_a + left_sin_a;
		}
	};
	Quad.prototype.offset = function (px, py)
	{
		this.tlx += px;
		this.tly += py;
		this.trx += px;
		this.try_ += py;
		this.brx += px;
		this.bry += py;
		this.blx += px;
		this.bly += py;
		return this;
	};
	Quad.prototype.bounding_box = function (rc)
	{
		rc.left =   cr.min(cr.min(this.tlx, this.trx),  cr.min(this.brx, this.blx));
		rc.top =    cr.min(cr.min(this.tly, this.try_), cr.min(this.bry, this.bly));
		rc.right =  cr.max(cr.max(this.tlx, this.trx),  cr.max(this.brx, this.blx));
		rc.bottom = cr.max(cr.max(this.tly, this.try_), cr.max(this.bry, this.bly));
	};
	Quad.prototype.contains_pt = function (x, y)
	{
		var v0x = this.trx - this.tlx;
		var v0y = this.try_ - this.tly;
		var v1x = this.brx - this.tlx;
		var v1y = this.bry - this.tly;
		var v2x = x - this.tlx;
		var v2y = y - this.tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		var dot11 = v1x * v1x + v1y * v1y
		var dot12 = v1x * v2x + v1y * v2y
		var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		if ((u >= 0.0) && (v > 0.0) && (u + v < 1))
			return true;
		v0x = this.blx - this.tlx;
		v0y = this.bly - this.tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return (u >= 0.0) && (v > 0.0) && (u + v < 1);
	};
	Quad.prototype.at = function (i, xory)
	{
		switch (i)
		{
			case 0: return xory ? this.tlx : this.tly;
			case 1: return xory ? this.trx : this.try_;
			case 2: return xory ? this.brx : this.bry;
			case 3: return xory ? this.blx : this.bly;
			case 4: return xory ? this.tlx : this.tly;		// same as 0, repeated for perf
			default: return xory ? this.tlx : this.tly;
		}
	};
	Quad.prototype.midX = function ()
	{
		return (this.tlx + this.trx  + this.brx + this.blx) / 4;
	};
	Quad.prototype.midY = function ()
	{
		return (this.tly + this.try_ + this.bry + this.bly) / 4;
	};
	Quad.prototype.intersects_segment = function (x1, y1, x2, y2)
	{
		if (this.contains_pt(x1, y1) || this.contains_pt(x2, y2))
			return true;
		var a1x, a1y, a2x, a2y;
		var i;
		for (i = 0; i < 4; i++)
		{
			a1x = this.at(i, true);
			a1y = this.at(i, false);
			a2x = this.at(i + 1, true);
			a2y = this.at(i + 1, false);
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y))
				return true;
		}
		return false;
	};
	Quad.prototype.intersects_quad = function (rhs)
	{
		var midx = rhs.midX();
		var midy = rhs.midY();
		if (this.contains_pt(midx, midy))
			return true;
		midx = this.midX();
		midy = this.midY();
		if (rhs.contains_pt(midx, midy))
			return true;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		var i, j;
		for (i = 0; i < 4; i++)
		{
			for (j = 0; j < 4; j++)
			{
				a1x = this.at(i, true);
				a1y = this.at(i, false);
				a2x = this.at(i + 1, true);
				a2y = this.at(i + 1, false);
				b1x = rhs.at(j, true);
				b1y = rhs.at(j, false);
				b2x = rhs.at(j + 1, true);
				b2y = rhs.at(j + 1, false);
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	cr.quad = Quad;
	cr.RGB = function (red, green, blue)
	{
		return Math.max(Math.min(red, 255), 0)
			 | (Math.max(Math.min(green, 255), 0) << 8)
			 | (Math.max(Math.min(blue, 255), 0) << 16);
	};
	cr.GetRValue = function (rgb)
	{
		return rgb & 0xFF;
	};
	cr.GetGValue = function (rgb)
	{
		return (rgb & 0xFF00) >> 8;
	};
	cr.GetBValue = function (rgb)
	{
		return (rgb & 0xFF0000) >> 16;
	};
	cr.shallowCopy = function (a, b, allowOverwrite)
	{
		var attr;
		for (attr in b)
		{
			if (b.hasOwnProperty(attr))
			{
;
				a[attr] = b[attr];
			}
		}
		return a;
	};
	cr.arrayRemove = function (arr, index)
	{
		var i, len;
		index = cr.floor(index);
		if (index < 0 || index >= arr.length)
			return;							// index out of bounds
		if (index === 0)					// removing first item
			arr.shift();
		else if (index === arr.length - 1)	// removing last item
			arr.pop();
		else
		{
			for (i = index, len = arr.length - 1; i < len; i++)
				arr[i] = arr[i + 1];
			arr.length = len;
		}
	};
	cr.shallowAssignArray = function(dest, src)
	{
		dest.length = src.length;
		var i, len;
		for (i = 0, len = src.length; i < len; i++)
			dest[i] = src[i];
	};
	cr.arrayFindRemove = function (arr, item)
	{
		var index = arr.indexOf(item);
		if (index !== -1)
			cr.arrayRemove(arr, index);
	};
	cr.clamp = function(x, a, b)
	{
		if (x < a)
			return a;
		else if (x > b)
			return b;
		else
			return x;
	};
	cr.to_radians = function(x)
	{
		return x / (180.0 / cr.PI);
	};
	cr.to_degrees = function(x)
	{
		return x * (180.0 / cr.PI);
	};
	cr.clamp_angle_degrees = function (a)
	{
		a %= 360;       // now in (-360, 360) range
		if (a < 0)
			a += 360;   // now in [0, 360) range
		return a;
	};
	cr.clamp_angle = function (a)
	{
		a %= 2 * cr.PI;       // now in (-2pi, 2pi) range
		if (a < 0)
			a += 2 * cr.PI;   // now in [0, 2pi) range
		return a;
	};
	cr.to_clamped_degrees = function (x)
	{
		return cr.clamp_angle_degrees(cr.to_degrees(x));
	};
	cr.to_clamped_radians = function (x)
	{
		return cr.clamp_angle(cr.to_radians(x));
	};
	cr.angleTo = function(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
        var dy = y2 - y1;
		return Math.atan2(dy, dx);
	};
	cr.angleDiff = function (a1, a2)
	{
		if (a1 === a2)
			return 0;
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		var n = s1 * s2 + c1 * c2;
		if (n >= 1)
			return 0;
		if (n <= -1)
			return cr.PI;
		return Math.acos(n);
	};
	cr.angleRotate = function (start, end, step)
	{
		var ss = Math.sin(start);
		var cs = Math.cos(start);
		var se = Math.sin(end);
		var ce = Math.cos(end);
		if (Math.acos(ss * se + cs * ce) > step)
		{
			if (cs * se - ss * ce > 0)
				return cr.clamp_angle(start + step);
			else
				return cr.clamp_angle(start - step);
		}
		else
			return cr.clamp_angle(end);
	};
	cr.angleClockwise = function (a1, a2)
	{
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		return c1 * s2 - s1 * c2 <= 0;
	};
	cr.rotatePtAround = function (px, py, a, ox, oy, getx)
	{
		if (a === 0)
			return getx ? px : py;
		var sin_a = Math.sin(a);
		var cos_a = Math.cos(a);
		px -= ox;
		py -= oy;
		var left_sin_a = px * sin_a;
		var top_sin_a = py * sin_a;
		var left_cos_a = px * cos_a;
		var top_cos_a = py * cos_a;
		px = left_cos_a - top_sin_a;
		py = top_cos_a + left_sin_a;
		px += ox;
		py += oy;
		return getx ? px : py;
	}
	cr.distanceTo = function(x1, y1, x2, y2)
	{
		var dx = x2 - x1;
        var dy = y2 - y1;
		return Math.sqrt(dx*dx + dy*dy);
	};
	cr.xor = function (x, y)
	{
		return !x !== !y;
	};
	cr.lerp = function (a, b, x)
	{
		return a + (b - a) * x;
	};
	cr.hasAnyOwnProperty = function (o)
	{
		var p;
		for (p in o)
		{
			if (o.hasOwnProperty(p))
				return true;
		}
		return false;
	};
	cr.wipe = function (obj)
	{
		var p;
		for (p in obj)
		{
			if (obj.hasOwnProperty(p))
				delete obj[p];
		}
	};
	var startup_time = +(new Date());
	cr.performance_now = function()
	{
		if (typeof window["performance"] !== "undefined")
		{
			var winperf = window["performance"];
			if (typeof winperf.now !== "undefined")
				return winperf.now();
			else if (typeof winperf["webkitNow"] !== "undefined")
				return winperf["webkitNow"]();
			else if (typeof winperf["msNow"] !== "undefined")
				return winperf["msNow"]();
		}
		return Date.now() - startup_time;
	};
	function ObjectSet_()
	{
		this.items = {};
		this.item_count = 0;
		this.values_cache = [];
		this.cache_valid = true;
		cr.seal(this);
	};
	ObjectSet_.prototype.contains = function (x)
	{
		return this.items.hasOwnProperty(x.toString());
	};
	ObjectSet_.prototype.add = function (x)
	{
		var str = x.toString();
		if (!this.items.hasOwnProperty(str))
		{
			this.items[str] = x;
			this.item_count++;
			this.cache_valid = false;
		}
		return this;
	};
	ObjectSet_.prototype.remove = function (x)
	{
		var str = x.toString();
		if (this.items.hasOwnProperty(str))
		{
			delete this.items[str];
			this.item_count--;
			this.cache_valid = false;
		}
		return this;
	};
	ObjectSet_.prototype.clear = function ()
	{
		cr.wipe(this.items);
		this.item_count = 0;
		this.values_cache.length = 0;
		this.cache_valid = true;
		return this;
	};
	ObjectSet_.prototype.isEmpty = function ()
	{
		return this.item_count === 0;
	};
	ObjectSet_.prototype.count = function ()
	{
		return this.item_count;
	};
	ObjectSet_.prototype.update_cache = function ()
	{
		if (this.cache_valid)
			return;
		this.values_cache.length = this.item_count;
		var p, n = 0;
		for (p in this.items)
		{
			if (this.items.hasOwnProperty(p))
				this.values_cache[n++] = this.items[p];
		}
;
		this.cache_valid = true;
	};
	ObjectSet_.prototype.values = function ()
	{
		this.update_cache();
		return this.values_cache.slice(0);
	};
	ObjectSet_.prototype.valuesRef = function ()
	{
		this.update_cache();
		return this.values_cache;
	};
	cr.ObjectSet = ObjectSet_;
	function KahanAdder_()
	{
		this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
		cr.seal(this);
	};
	KahanAdder_.prototype.add = function (v)
	{
		this.y = v - this.c;
	    this.t = this.sum + this.y;
	    this.c = (this.t - this.sum) - this.y;
	    this.sum = this.t;
	};
    KahanAdder_.prototype.reset = function ()
    {
        this.c = 0;
        this.y = 0;
        this.t = 0;
        this.sum = 0;
    };
	cr.KahanAdder = KahanAdder_;
	cr.regexp_escape = function(text)
	{
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	function CollisionPoly_(pts_array_)
	{
		this.pts_cache = [];
		this.set_pts(pts_array_);
		cr.seal(this);
	};
	CollisionPoly_.prototype.set_pts = function(pts_array_)
	{
		this.pts_array = pts_array_;
		this.pts_count = pts_array_.length / 2;			// x, y, x, y... in array
		this.pts_cache.length = pts_array_.length;
		this.cache_width = -1;
		this.cache_height = -1;
		this.cache_angle = 0;
	};
	CollisionPoly_.prototype.is_empty = function()
	{
		return !this.pts_array.length;
	};
	CollisionPoly_.prototype.set_from_quad = function(q, offx, offy, w, h)
	{
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = q.tlx - offx;
		myptscache[1] = q.tly - offy;
		myptscache[2] = q.trx - offx;
		myptscache[3] = q.try_ - offy;
		myptscache[4] = q.brx - offx;
		myptscache[5] = q.bry - offy;
		myptscache[6] = q.blx - offx;
		myptscache[7] = q.bly - offy;
		this.cache_width = w;
		this.cache_height = h;
	};
	CollisionPoly_.prototype.set_from_poly = function (r)
	{
		this.pts_count = r.pts_count;
		cr.shallowAssignArray(this.pts_cache, r.pts_cache);
	};
	CollisionPoly_.prototype.cache_poly = function(w, h, a)
	{
		if (this.cache_width === w && this.cache_height === h && this.cache_angle === a)
			return;		// cache up-to-date
		this.cache_width = w;
		this.cache_height = h;
		this.cache_angle = a;
		var i, len, x, y;
		var sina = 0;
		var cosa = 1;
		var myptsarray = this.pts_array;
		var myptscache = this.pts_cache;
		if (a !== 0)
		{
			sina = Math.sin(a);
			cosa = Math.cos(a);
		}
		for (i = 0, len = this.pts_count; i < len; i++)
		{
			x = myptsarray[i*2] * w;
			y = myptsarray[i*2+1] * h;
			myptscache[i*2] = (x * cosa) - (y * sina);
			myptscache[i*2+1] = (y * cosa) + (x * sina);
		}
	};
	CollisionPoly_.prototype.contains_pt = function (a2x, a2y)
	{
		var myptscache = this.pts_cache;
		if (a2x === myptscache[0] && a2y === myptscache[1])
			return true;
		var i, x, y, len = this.pts_count;
		var bboxLeft = myptscache[0];
		var bboxRight = bboxLeft;
		var bboxTop = myptscache[1];
		var bboxBottom = bboxTop;
		for (i = 1; i < len; i++)
		{
			x = myptscache[i*2];
			y = myptscache[i*2+1];
			if (x < bboxLeft)
				bboxLeft = x;
			if (x > bboxRight)
				bboxRight = x;
			if (y < bboxTop)
				bboxTop = y;
			if (y > bboxBottom)
				bboxBottom = y;
		}
		var a1x = bboxLeft - 110;
		var a1y = bboxTop - 101;
		var a3x = bboxRight + 131
		var a3y = bboxBottom + 120;
		var b1x, b1y, b2x, b2y;
		var count1 = 0, count2 = 0;
		for (i = 0; i < len; i++)
		{
			b1x = myptscache[i*2];
			b1y = myptscache[i*2+1];
			b2x = myptscache[((i+1)%len)*2];
			b2y = myptscache[((i+1)%len)*2+1];
			if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
				count1++;
			if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y))
				count2++;
		}
		return (count1 % 2 === 1) || (count2 % 2 === 1);
	};
	CollisionPoly_.prototype.intersects_poly = function (rhs, offx, offy)
	{
		var rhspts = rhs.pts_cache;
		var mypts = this.pts_cache;
		if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy))
			return true;
		if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy))
			return true;
		var i, leni, j, lenj;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		for (i = 0, leni = this.pts_count; i < leni; i++)
		{
			a1x = mypts[i*2];
			a1y = mypts[i*2+1];
			a2x = mypts[((i+1)%leni)*2];
			a2y = mypts[((i+1)%leni)*2+1];
			for (j = 0, lenj = rhs.pts_count; j < lenj; j++)
			{
				b1x = rhspts[j*2] + offx;
				b1y = rhspts[j*2+1] + offy;
				b2x = rhspts[((j+1)%lenj)*2] + offx;
				b2y = rhspts[((j+1)%lenj)*2+1] + offy;
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	CollisionPoly_.prototype.intersects_segment = function (offx, offy, x1, y1, x2, y2)
	{
		var mypts = this.pts_cache;
		if (this.contains_pt(x1 - offx, y1 - offy))
			return true;
		var i, leni;
		var a1x, a1y, a2x, a2y;
		for (i = 0, leni = this.pts_count; i < leni; i++)
		{
			a1x = mypts[i*2] + offx;
			a1y = mypts[i*2+1] + offy;
			a2x = mypts[((i+1)%leni)*2] + offx;
			a2y = mypts[((i+1)%leni)*2+1] + offy;
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y))
				return true;
		}
		return false;
	};
	cr.CollisionPoly = CollisionPoly_;
	var fxNames = [ "lighter",
					"xor",
					"copy",
					"destination-over",
					"source-in",
					"destination-in",
					"source-out",
					"destination-out",
					"source-atop",
					"destination-atop"];
	cr.effectToCompositeOp = function(effect)
	{
		if (effect <= 0 || effect >= 11)
			return "source-over";
		return fxNames[effect - 1];	// not including "none" so offset by 1
	};
	cr.setGLBlend = function(this_, effect, gl)
	{
		if (!gl)
			return;
		this_.srcBlend = gl.ONE;
		this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
		switch (effect) {
		case 1:		// lighter (additive)
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ONE;
			break;
		case 2:		// xor
			break;	// todo
		case 3:		// copy
			this_.srcBlend = gl.ONE;
			this_.destBlend = gl.ZERO;
			break;
		case 4:		// destination-over
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ONE;
			break;
		case 5:		// source-in
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 6:		// destination-in
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		case 7:		// source-out
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.ZERO;
			break;
		case 8:		// destination-out
			this_.srcBlend = gl.ZERO;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 9:		// source-atop
			this_.srcBlend = gl.DST_ALPHA;
			this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
			break;
		case 10:	// destination-atop
			this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
			this_.destBlend = gl.SRC_ALPHA;
			break;
		}
	};
	cr.round6dp = function (x)
	{
		return Math.round(x * 1000000) / 1000000;
	};
	/*
	var localeCompare_options = {
		"usage": "search",
		"sensitivity": "accent"
	};
	var has_localeCompare = !!"a".localeCompare;
	var localeCompare_works1 = (has_localeCompare && "a".localeCompare("A", undefined, localeCompare_options) === 0);
	var localeCompare_works2 = (has_localeCompare && "a".localeCompare("á", undefined, localeCompare_options) !== 0);
	var supports_localeCompare = (has_localeCompare && localeCompare_works1 && localeCompare_works2);
	*/
	cr.equals_nocase = function (a, b)
	{
		if (typeof a !== "string" || typeof b !== "string")
			return false;
		if (a.length !== b.length)
			return false;
		if (a === b)
			return true;
		/*
		if (supports_localeCompare)
		{
			return (a.localeCompare(b, undefined, localeCompare_options) === 0);
		}
		else
		{
		*/
			return a.toLowerCase() === b.toLowerCase();
	};
}());
var MatrixArray=typeof Float32Array!=="undefined"?Float32Array:Array,glMatrixArrayType=MatrixArray,vec3={},mat3={},mat4={},quat4={};vec3.create=function(a){var b=new MatrixArray(3);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2]);return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a===c)return a[0]+=b[0],a[1]+=b[1],a[2]+=b[2],a;c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a===c)return a[0]-=b[0],a[1]-=b[1],a[2]-=b[2],a;c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a===c)return a[0]*=b,a[1]*=b,a[2]*=b,a;c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g===1)return b[0]=c,b[1]=d,b[2]=e,b}else return b[0]=0,b[1]=0,b[2]=0,b;g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1],a=a[2],g=b[0],f=b[1],b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1],a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1],a=a[2]-b[2],b=Math.sqrt(d*d+e*e+a*a);if(!b)return c[0]=0,c[1]=0,c[2]=0,c;b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};
mat3.create=function(a){var b=new MatrixArray(9);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8]);return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[15]=1;b[14]=0;b[13]=0;b[12]=0;b[11]=0;b[10]=a[8];b[9]=a[7];b[8]=a[6];b[7]=0;b[6]=a[5];b[5]=a[4];b[4]=a[3];b[3]=0;b[2]=a[2];b[1]=a[1];b[0]=a[0];return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};mat4.create=function(a){var b=new MatrixArray(16);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3],b[4]=a[4],b[5]=a[5],b[6]=a[6],b[7]=a[7],b[8]=a[8],b[9]=a[9],b[10]=a[10],b[11]=a[11],b[12]=a[12],b[13]=a[13],b[14]=a[14],b[15]=a[15]);return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a===b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],n=a[11],o=a[12],m=a[13],p=a[14],a=a[15];return o*k*h*e-j*m*h*e-o*f*l*e+g*m*l*e+j*f*p*e-g*k*p*e-o*k*d*i+j*m*d*i+o*c*l*i-b*m*l*i-j*c*p*i+b*k*p*i+o*f*d*n-g*m*d*n-o*c*h*n+b*m*h*n+g*c*p*n-b*f*p*n-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],n=a[10],o=a[11],m=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*m,y=k*r-n*m,z=k*s-o*m,C=l*r-n*p,D=l*s-o*p,E=n*s-o*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+n*v-o*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-m*w+r*t-s*B)*q;b[7]=(k*w-n*t+o*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(m*v-p*t+s*A)*q;b[11]=(-k*v+l*t-o*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-m*u+p*B-r*A)*q;b[15]=(k*u-l*B+n*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,n=-k*g+h*i,o=j*g-f*i,m=c*l+d*n+e*o;if(!m)return null;m=1/m;b||(b=mat3.create());b[0]=l*m;b[1]=(-k*d+e*j)*m;b[2]=(h*d-e*f)*m;b[3]=n*m;b[4]=(k*c-e*i)*m;b[5]=(-h*c+e*g)*m;b[6]=o*m;b[7]=(-j*c+d*i)*m;b[8]=(f*c-d*g)*m;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],n=a[9],o=a[10],m=a[11],p=a[12],r=a[13],s=a[14],a=a[15],A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14],b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*n+u*r;c[2]=A*g+B*j+t*o+u*s;c[3]=A*f+B*k+t*m+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*n+y*r;c[6]=v*g+w*j+x*o+y*s;c[7]=v*f+w*k+x*m+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*n+E*r;c[10]=z*g+C*
j+D*o+E*s;c[11]=z*f+C*k+D*m+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*n+b*r;c[14]=q*g+F*j+G*o+b*s;c[15]=q*f+F*k+G*m+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1],b=b[2],g,f,h,i,j,k,l,n,o,m,p,r;if(!c||a===c)return a[12]=a[0]*d+a[4]*e+a[8]*b+a[12],a[13]=a[1]*d+a[5]*e+a[9]*b+a[13],a[14]=a[2]*d+a[6]*e+a[10]*b+a[14],a[15]=a[3]*d+a[7]*e+a[11]*b+a[15],a;g=a[0];f=a[1];h=a[2];i=a[3];j=a[4];k=a[5];l=a[6];n=a[7];o=a[8];m=a[9];p=a[10];r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=n;c[8]=o;c[9]=m;c[10]=p;c[11]=r;c[12]=g*d+j*e+o*b+a[12];c[13]=f*d+k*e+m*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+n*e+r*b+a[15];
return c};mat4.scale=function(a,b,c){var d=b[0],e=b[1],b=b[2];if(!c||a===c)return a[0]*=d,a[1]*=d,a[2]*=d,a[3]*=d,a[4]*=e,a[5]*=e,a[6]*=e,a[7]*=e,a[8]*=b,a[9]*=b,a[10]*=b,a[11]*=b,a;c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1],c=c[2],f=Math.sqrt(e*e+g*g+c*c),h,i,j,k,l,n,o,m,p,r,s,A,B,t,u,v,w,x,y,z;if(!f)return null;f!==1&&(f=1/f,e*=f,g*=f,c*=f);h=Math.sin(b);i=Math.cos(b);j=1-i;b=a[0];f=a[1];k=a[2];l=a[3];n=a[4];o=a[5];m=a[6];p=a[7];r=a[8];s=a[9];A=a[10];B=a[11];t=e*e*j+i;u=g*e*j+c*h;v=c*e*j-g*h;w=e*g*j-c*h;x=g*g*j+i;y=c*g*j+e*h;z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;d?a!==d&&(d[12]=a[12],d[13]=a[13],d[14]=a[14],d[15]=a[15]):d=a;d[0]=b*t+n*u+r*v;d[1]=f*t+o*u+s*v;d[2]=k*t+m*u+A*
v;d[3]=l*t+p*u+B*v;d[4]=b*w+n*x+r*y;d[5]=f*w+o*x+s*y;d[6]=k*w+m*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+n*e+r*g;d[9]=f*z+o*e+s*g;d[10]=k*z+m*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[0]=a[0],c[1]=a[1],c[2]=a[2],c[3]=a[3],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];c?a!==c&&(c[4]=a[4],c[5]=a[5],c[6]=a[6],c[7]=a[7],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b),b=Math.cos(b),e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];c?a!==c&&(c[8]=a[8],c[9]=a[9],c[10]=a[10],c[11]=a[11],c[12]=a[12],c[13]=a[13],c[14]=a[14],c[15]=a[15]):c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b*=a;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e,g,f,h,i,j,k,l,n=a[0],o=a[1],a=a[2];g=c[0];f=c[1];e=c[2];c=b[1];j=b[2];if(n===b[0]&&o===c&&a===j)return mat4.identity(d);c=n-b[0];j=o-b[1];k=a-b[2];l=1/Math.sqrt(c*c+j*j+k*k);c*=l;j*=l;k*=l;b=f*k-e*j;e=e*c-g*k;g=g*j-f*c;(l=Math.sqrt(b*b+e*e+g*g))?(l=1/l,b*=l,e*=l,g*=l):g=e=b=0;f=j*g-k*e;h=k*b-c*g;i=c*e-j*b;(l=Math.sqrt(f*f+h*h+i*i))?(l=1/l,f*=l,h*=l,i*=l):i=h=f=0;d[0]=b;d[1]=f;d[2]=c;d[3]=0;d[4]=e;d[5]=h;d[6]=j;d[7]=0;d[8]=g;d[9]=i;d[10]=k;d[11]=
0;d[12]=-(b*n+e*o+g*a);d[13]=-(f*n+h*o+i*a);d[14]=-(c*n+j*o+k*a);d[15]=1;return d};mat4.fromRotationTranslation=function(a,b,c){c||(c=mat4.create());var d=a[0],e=a[1],g=a[2],f=a[3],h=d+d,i=e+e,j=g+g,a=d*h,k=d*i;d*=j;var l=e*i;e*=j;g*=j;h*=f;i*=f;f*=j;c[0]=1-(l+g);c[1]=k+f;c[2]=d-i;c[3]=0;c[4]=k-f;c[5]=1-(a+g);c[6]=e+h;c[7]=0;c[8]=d+i;c[9]=e-h;c[10]=1-(a+l);c[11]=0;c[12]=b[0];c[13]=b[1];c[14]=b[2];c[15]=1;return c};
mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4.create=function(a){var b=new MatrixArray(4);a&&(b[0]=a[0],b[1]=a[1],b[2]=a[2],b[3]=a[3]);return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a===b)return a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e)),a;b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a===b)return a[0]*=-1,a[1]*=-1,a[2]*=-1,a;b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2],a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f===0)return b[0]=0,b[1]=0,b[2]=0,b[3]=0,b;f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],a=a[3],f=b[0],h=b[1],i=b[2],b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2],b=a[0],f=a[1],h=a[2],a=a[3],i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d,d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=k-g;b[4]=1-(j+e);b[5]=d+f;b[6]=c+h;b[7]=d-f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c*=i;var l=d*h;d*=i;e*=i;f*=g;h*=g;g*=i;b[0]=1-(l+e);b[1]=k+g;b[2]=c-h;b[3]=0;b[4]=k-g;b[5]=1-(j+e);b[6]=d+f;b[7]=0;b[8]=c+h;b[9]=d-f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
quat4.slerp=function(a,b,c,d){d||(d=a);var e=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],g,f;if(Math.abs(e)>=1)return d!==a&&(d[0]=a[0],d[1]=a[1],d[2]=a[2],d[3]=a[3]),d;g=Math.acos(e);f=Math.sqrt(1-e*e);if(Math.abs(f)<0.001)return d[0]=a[0]*0.5+b[0]*0.5,d[1]=a[1]*0.5+b[1]*0.5,d[2]=a[2]*0.5+b[2]*0.5,d[3]=a[3]*0.5+b[3]*0.5,d;e=Math.sin((1-c)*g)/f;c=Math.sin(c*g)/f;d[0]=a[0]*e+b[0]*c;d[1]=a[1]*e+b[1]*c;d[2]=a[2]*e+b[2]*c;d[3]=a[3]*e+b[3]*c;return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
(function()
{
	var MAX_VERTICES = 8000;						// equates to 2500 objects being drawn
	var MAX_INDICES = (MAX_VERTICES / 2) * 3;		// 6 indices for every 4 vertices
	var MAX_POINTS = 8000;
	var MULTI_BUFFERS = 4;							// cycle 4 buffers to try and avoid blocking
	var BATCH_NULL = 0;
	var BATCH_QUAD = 1;
	var BATCH_SETTEXTURE = 2;
	var BATCH_SETOPACITY = 3;
	var BATCH_SETBLEND = 4;
	var BATCH_UPDATEMODELVIEW = 5;
	var BATCH_RENDERTOTEXTURE = 6;
	var BATCH_CLEAR = 7;
	var BATCH_POINTS = 8;
	var BATCH_SETPROGRAM = 9;
	var BATCH_SETPROGRAMPARAMETERS = 10;
	function GLWrap_(gl, isMobile)
	{
		this.width = 0;		// not yet known, wait for call to setSize()
		this.height = 0;
		this.cam = vec3.create([0, 0, 100]);			// camera position
		this.look = vec3.create([0, 0, 0]);				// lookat position
		this.up = vec3.create([0, 1, 0]);				// up vector
		this.worldScale = vec3.create([1, 1, 1]);		// world scaling factor
		this.matP = mat4.create();						// perspective matrix
		this.matMV = mat4.create();						// model view matrix
		this.lastMV = mat4.create();
		this.currentMV = mat4.create();
		this.gl = gl;
		this.initState();
	};
	GLWrap_.prototype.initState = function ()
	{
		var gl = this.gl;
		var i, len;
		this.lastOpacity = 1;
		this.lastTexture = null;
		this.currentOpacity = 1;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.DEPTH_TEST);
		this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this.lastSrcBlend = gl.ONE;
		this.lastDestBlend = gl.ONE_MINUS_SRC_ALPHA;
		this.pointBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		this.vertexBuffers = new Array(MULTI_BUFFERS);
		this.texcoordBuffers = new Array(MULTI_BUFFERS);
		for (i = 0; i < MULTI_BUFFERS; i++)
		{
			this.vertexBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[i]);
			this.texcoordBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[i]);
		}
		this.curBuffer = 0;
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.vertexData = new Float32Array(MAX_VERTICES * 2);
		this.texcoordData = new Float32Array(MAX_VERTICES * 2);
		this.pointData = new Float32Array(MAX_POINTS * 4);
		var indexData = new Uint16Array(MAX_INDICES);
		i = 0, len = MAX_INDICES;
		var fv = 0;
		while (i < len)
		{
			indexData[i++] = fv;		// top left
			indexData[i++] = fv + 1;	// top right
			indexData[i++] = fv + 2;	// bottom right (first tri)
			indexData[i++] = fv;		// top left
			indexData[i++] = fv + 2;	// bottom right
			indexData[i++] = fv + 3;	// bottom left
			fv += 4;
		}
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
		this.vertexPtr = 0;
		this.pointPtr = 0;
		var fsSource, vsSource;
		this.shaderPrograms = [];
		fsSource = [
			"varying mediump vec2 vTex;",
			"uniform lowp float opacity;",
			"uniform lowp sampler2D samplerFront;",
			"void main(void) {",
			"	gl_FragColor = texture2D(samplerFront, vTex);",
			"	gl_FragColor *= opacity;",
			"}"
		].join("\n");
		vsSource = [
			"attribute highp vec2 aPos;",
			"attribute mediump vec2 aTex;",
			"varying mediump vec2 vTex;",
			"uniform highp mat4 matP;",
			"uniform highp mat4 matMV;",
			"void main(void) {",
			"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
			"	vTex = aTex;",
			"}"
		].join("\n");
		var shaderProg = this.createShaderProgram({src: fsSource}, vsSource, "<default>");
;
		this.shaderPrograms.push(shaderProg);		// Default shader is always shader 0
		fsSource = [
			"uniform mediump sampler2D samplerFront;",
			"varying lowp float opacity;",
			"void main(void) {",
			"	gl_FragColor = texture2D(samplerFront, gl_PointCoord);",
			"	gl_FragColor *= opacity;",
			"}"
		].join("\n");
		var pointVsSource = [
			"attribute vec4 aPos;",
			"varying float opacity;",
			"uniform mat4 matP;",
			"uniform mat4 matMV;",
			"void main(void) {",
			"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
			"	gl_PointSize = aPos.z;",
			"	opacity = aPos.w;",
			"}"
		].join("\n");
		shaderProg = this.createShaderProgram({src: fsSource}, pointVsSource, "<point>");
;
		this.shaderPrograms.push(shaderProg);		// Point shader is always shader 1
		for (var shader_name in cr.shaders)
		{
			if (cr.shaders.hasOwnProperty(shader_name))
				this.shaderPrograms.push(this.createShaderProgram(cr.shaders[shader_name], vsSource, shader_name));
		}
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.batch = [];
		this.batchPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.lastProgram = -1;				// start -1 so first switchProgram can do work
		this.currentProgram = -1;			// current program during batch execution
		this.currentShader = null;
		this.fbo = gl.createFramebuffer();
		this.renderToTex = null;
		this.tmpVec3 = vec3.create([0, 0, 0]);
;
;
		var pointsizes = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
		this.minPointSize = pointsizes[0];
		this.maxPointSize = pointsizes[1];
;
		this.switchProgram(0);
		cr.seal(this);
	};
	function GLShaderProgram(gl, shaderProgram, name)
	{
		this.gl = gl;
		this.shaderProgram = shaderProgram;
		this.name = name;
		this.locAPos = gl.getAttribLocation(shaderProgram, "aPos");
		this.locATex = gl.getAttribLocation(shaderProgram, "aTex");
		this.locMatP = gl.getUniformLocation(shaderProgram, "matP");
		this.locMatMV = gl.getUniformLocation(shaderProgram, "matMV");
		this.locOpacity = gl.getUniformLocation(shaderProgram, "opacity");
		this.locSamplerFront = gl.getUniformLocation(shaderProgram, "samplerFront");
		this.locSamplerBack = gl.getUniformLocation(shaderProgram, "samplerBack");
		this.locDestStart = gl.getUniformLocation(shaderProgram, "destStart");
		this.locDestEnd = gl.getUniformLocation(shaderProgram, "destEnd");
		this.locSeconds = gl.getUniformLocation(shaderProgram, "seconds");
		this.locPixelWidth = gl.getUniformLocation(shaderProgram, "pixelWidth");
		this.locPixelHeight = gl.getUniformLocation(shaderProgram, "pixelHeight");
		this.locLayerScale = gl.getUniformLocation(shaderProgram, "layerScale");
		if (this.locOpacity)
			gl.uniform1f(this.locOpacity, 1);
		if (this.locSamplerFront)
			gl.uniform1i(this.locSamplerFront, 0);
		if (this.locSamplerBack)
			gl.uniform1i(this.locSamplerBack, 1);
		if (this.locDestStart)
			gl.uniform2f(this.locDestStart, 0.0, 0.0);
		if (this.locDestEnd)
			gl.uniform2f(this.locDestEnd, 1.0, 1.0);
		this.hasCurrentMatMV = false;		// matMV needs updating
	};
	GLWrap_.prototype.createShaderProgram = function(shaderEntry, vsSource, name)
	{
		var gl = this.gl;
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, shaderEntry.src);
		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
		{
;
			gl.deleteShader(fragmentShader);
			return null;
		}
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vsSource);
		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
		{
;
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			return null;
		}
		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, fragmentShader);
		gl.attachShader(shaderProgram, vertexShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
		{
;
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			gl.deleteProgram(shaderProgram);
			return null;
		}
		gl.useProgram(shaderProgram);
		gl.validateProgram(shaderProgram);
;
		gl.deleteShader(fragmentShader);
		gl.deleteShader(vertexShader);
		var ret = new GLShaderProgram(gl, shaderProgram, name);
		ret.extendBoxHorizontal = shaderEntry.extendBoxHorizontal || 0;
		ret.extendBoxVertical = shaderEntry.extendBoxVertical || 0;
		ret.crossSampling = !!shaderEntry.crossSampling;
		ret.animated = !!shaderEntry.animated;
		ret.parameters = shaderEntry.parameters || [];
		var i, len;
		for (i = 0, len = ret.parameters.length; i < len; i++)
		{
			ret.parameters[i][1] = gl.getUniformLocation(shaderProgram, ret.parameters[i][0]);
			gl.uniform1f(ret.parameters[i][1], 0);
		}
		cr.seal(ret);
		return ret;
	};
	GLWrap_.prototype.getShaderIndex = function(name_)
	{
		var i, len;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++)
		{
			if (this.shaderPrograms[i].name === name_)
				return i;
		}
		return -1;
	};
	GLWrap_.prototype.project = function (x, y, out)
	{
		var viewport = [0, 0, this.width, this.height];
		var mv = this.matMV;
		var proj = this.matP;
		var fTempo = [0, 0, 0, 0, 0, 0, 0, 0];
		fTempo[0] = mv[0]*x+mv[4]*y+mv[12];
		fTempo[1] = mv[1]*x+mv[5]*y+mv[13];
		fTempo[2] = mv[2]*x+mv[6]*y+mv[14];
		fTempo[3] = mv[3]*x+mv[7]*y+mv[15];
		fTempo[4] = proj[0]*fTempo[0]+proj[4]*fTempo[1]+proj[8]*fTempo[2]+proj[12]*fTempo[3];
		fTempo[5] = proj[1]*fTempo[0]+proj[5]*fTempo[1]+proj[9]*fTempo[2]+proj[13]*fTempo[3];
		fTempo[6] = proj[2]*fTempo[0]+proj[6]*fTempo[1]+proj[10]*fTempo[2]+proj[14]*fTempo[3];
		fTempo[7] = -fTempo[2];
		if(fTempo[7]===0.0)	//The w value
			return;
		fTempo[7]=1.0/fTempo[7];
		fTempo[4]*=fTempo[7];
		fTempo[5]*=fTempo[7];
		fTempo[6]*=fTempo[7];
		out[0]=(fTempo[4]*0.5+0.5)*viewport[2]+viewport[0];
		out[1]=(fTempo[5]*0.5+0.5)*viewport[3]+viewport[1];
	};
	GLWrap_.prototype.setSize = function(w, h, force)
	{
		if (this.width === w && this.height === h && !force)
			return;
		this.endBatch();
		this.width = w;
		this.height = h;
		this.gl.viewport(0, 0, w, h);
		mat4.perspective(45, w / h, 1, 1000, this.matP);
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		var tl = [0, 0];
		var br = [0, 0];
		this.project(0, 0, tl);
		this.project(1, 1, br);
		this.worldScale[0] = 1 / (br[0] - tl[0]);
		this.worldScale[1] = -1 / (br[1] - tl[1]);
		var i, len, s;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++)
		{
			s = this.shaderPrograms[i];
			s.hasCurrentMatMV = false;
			if (s.locMatP)
			{
				this.gl.useProgram(s.shaderProgram);
				this.gl.uniformMatrix4fv(s.locMatP, false, this.matP);
			}
		}
		this.gl.useProgram(this.shaderPrograms[this.lastProgram].shaderProgram);
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.lastTexture = null;
	};
	GLWrap_.prototype.resetModelView = function ()
	{
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		mat4.scale(this.matMV, this.worldScale);
	};
	GLWrap_.prototype.translate = function (x, y)
	{
		if (x === 0 && y === 0)
			return;
		this.tmpVec3[0] = x;// * this.worldScale[0];
		this.tmpVec3[1] = y;// * this.worldScale[1];
		this.tmpVec3[2] = 0;
		mat4.translate(this.matMV, this.tmpVec3);
	};
	GLWrap_.prototype.scale = function (x, y)
	{
		if (x === 1 && y === 1)
			return;
		this.tmpVec3[0] = x;
		this.tmpVec3[1] = y;
		this.tmpVec3[2] = 1;
		mat4.scale(this.matMV, this.tmpVec3);
	};
	GLWrap_.prototype.rotateZ = function (a)
	{
		if (a === 0)
			return;
		mat4.rotateZ(this.matMV, a);
	};
	GLWrap_.prototype.updateModelView = function()
	{
		var anydiff = false;
		for (var i = 0; i < 16; i++)
		{
			if (this.lastMV[i] !== this.matMV[i])
			{
				anydiff = true;
				break;
			}
		}
		if (!anydiff)
			return;
		var b = this.pushBatch();
		b.type = BATCH_UPDATEMODELVIEW;
		if (b.mat4param)
			mat4.set(this.matMV, b.mat4param);
		else
			b.mat4param = mat4.create(this.matMV);
		mat4.set(this.matMV, this.lastMV);
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	/*
	var debugBatch = false;
	jQuery(document).mousedown(
		function(info) {
			if (info.which === 2)
				debugBatch = true;
		}
	);
	*/
	function GLBatchJob(type_, glwrap_)
	{
		this.type = type_;
		this.glwrap = glwrap_;
		this.gl = glwrap_.gl;
		this.opacityParam = 0;		// for setOpacity()
		this.startIndex = 0;		// for quad()
		this.indexCount = 0;		// "
		this.texParam = null;		// for setTexture()
		this.mat4param = null;		// for updateModelView()
		this.shaderParams = [];		// for user parameters
		cr.seal(this);
	};
	GLBatchJob.prototype.doSetTexture = function ()
	{
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texParam);
	};
	GLBatchJob.prototype.doSetOpacity = function ()
	{
		var o = this.opacityParam;
		var glwrap = this.glwrap;
		glwrap.currentOpacity = o;
		var curProg = glwrap.currentShader;
		if (curProg.locOpacity)
			this.gl.uniform1f(curProg.locOpacity, o);
	};
	GLBatchJob.prototype.doQuad = function ()
	{
		this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, this.startIndex * 2);
	};
	GLBatchJob.prototype.doSetBlend = function ()
	{
		this.gl.blendFunc(this.startIndex, this.indexCount);
	};
	GLBatchJob.prototype.doUpdateModelView = function ()
	{
		var i, len, s, shaderPrograms = this.glwrap.shaderPrograms, currentProgram = this.glwrap.currentProgram;
		for (i = 0, len = shaderPrograms.length; i < len; i++)
		{
			s = shaderPrograms[i];
			if (i === currentProgram && s.locMatMV)
			{
				this.gl.uniformMatrix4fv(s.locMatMV, false, this.mat4param);
				s.hasCurrentMatMV = true;
			}
			else
				s.hasCurrentMatMV = false;
		}
		mat4.set(this.mat4param, this.glwrap.currentMV);
	};
	GLBatchJob.prototype.doRenderToTexture = function ()
	{
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (this.texParam)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texParam, 0);
;
		}
		else
		{
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	};
	GLBatchJob.prototype.doClear = function ()
	{
		var gl = this.gl;
		if (this.startIndex === 0)		// clear whole surface
		{
			gl.clearColor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
		else							// clear rectangle
		{
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(this.gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}
	};
	GLBatchJob.prototype.doPoints = function ()
	{
		var gl = this.gl;
		var glwrap = this.glwrap;
		var s = glwrap.shaderPrograms[1];
		gl.useProgram(s.shaderProgram);
		if (!s.hasCurrentMatMV && s.locMatMV)
		{
			gl.uniformMatrix4fv(s.locMatMV, false, glwrap.currentMV);
			s.hasCurrentMatMV = true;
		}
		gl.enableVertexAttribArray(s.locAPos);
		gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.pointBuffer);
		gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, this.startIndex / 4, this.indexCount);
		s = glwrap.currentShader;
		gl.useProgram(s.shaderProgram);
		if (s.locAPos >= 0)
		{
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
		}
		if (s.locATex >= 0)
		{
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
	};
	GLBatchJob.prototype.doSetProgram = function ()
	{
		var gl = this.gl;
		var glwrap = this.glwrap;
		var s = glwrap.shaderPrograms[this.startIndex];		// recycled param to save memory
		glwrap.currentProgram = this.startIndex;			// current batch program
		glwrap.currentShader = s;
		gl.useProgram(s.shaderProgram);						// switch to
		if (!s.hasCurrentMatMV && s.locMatMV)
		{
			gl.uniformMatrix4fv(s.locMatMV, false, glwrap.currentMV);
			s.hasCurrentMatMV = true;
		}
		if (s.locOpacity)
			gl.uniform1f(s.locOpacity, glwrap.currentOpacity);
		if (s.locAPos >= 0)
		{
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
		}
		if (s.locATex >= 0)
		{
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
	}
	GLBatchJob.prototype.doSetProgramParameters = function ()
	{
		var i, len, s = this.glwrap.currentShader;
		var gl = this.gl;
		if (s.locSamplerBack)
		{
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texParam);
			gl.activeTexture(gl.TEXTURE0);
		}
		if (s.locPixelWidth)
			gl.uniform1f(s.locPixelWidth, this.mat4param[0]);
		if (s.locPixelHeight)
			gl.uniform1f(s.locPixelHeight, this.mat4param[1]);
		if (s.locDestStart)
			gl.uniform2f(s.locDestStart, this.mat4param[2], this.mat4param[3]);
		if (s.locDestEnd)
			gl.uniform2f(s.locDestEnd, this.mat4param[4], this.mat4param[5]);
		if (s.locLayerScale)
			gl.uniform1f(s.locLayerScale, this.mat4param[6]);
		if (s.locSeconds)
			gl.uniform1f(s.locSeconds, cr.performance_now() / 1000.0);
		if (s.parameters.length)
		{
			for (i = 0, len = s.parameters.length; i < len; i++)
			{
				gl.uniform1f(s.parameters[i][1], this.shaderParams[i]);
			}
		}
	};
	GLWrap_.prototype.pushBatch = function ()
	{
		if (this.batchPtr === this.batch.length)
			this.batch.push(new GLBatchJob(BATCH_NULL, this));
		return this.batch[this.batchPtr++];
	};
	GLWrap_.prototype.endBatch = function ()
	{
		if (this.batchPtr === 0)
			return;
		if (this.gl.isContextLost())
			return;
		var gl = this.gl;
		if (this.pointPtr > 0)
		{
			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, this.pointData.subarray(0, this.pointPtr), gl.STREAM_DRAW);
			if (s && s.locAPos >= 0 && s.name === "<point>")
				gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		}
		if (this.vertexPtr > 0)
		{
			var s = this.currentShader;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[this.curBuffer]);
			gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.subarray(0, this.vertexPtr), gl.STREAM_DRAW);
			if (s && s.locAPos >= 0 && s.name !== "<point>")
				gl.vertexAttribPointer(s.locAPos, 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[this.curBuffer]);
			gl.bufferData(gl.ARRAY_BUFFER, this.texcoordData.subarray(0, this.vertexPtr), gl.STREAM_DRAW);
			if (s && s.locATex >= 0 && s.name !== "<point>")
				gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
		var i, len, b;
		for (i = 0, len = this.batchPtr; i < len; i++)
		{
			b = this.batch[i];
			switch (b.type) {
			case BATCH_QUAD:
				b.doQuad();
				break;
			case BATCH_SETTEXTURE:
				b.doSetTexture();
				break;
			case BATCH_SETOPACITY:
				b.doSetOpacity();
				break;
			case BATCH_SETBLEND:
				b.doSetBlend();
				break;
			case BATCH_UPDATEMODELVIEW:
				b.doUpdateModelView();
				break;
			case BATCH_RENDERTOTEXTURE:
				b.doRenderToTexture();
				break;
			case BATCH_CLEAR:
				b.doClear();
				break;
			case BATCH_POINTS:
				b.doPoints();
				break;
			case BATCH_SETPROGRAM:
				b.doSetProgram();
				break;
			case BATCH_SETPROGRAMPARAMETERS:
				b.doSetProgramParameters();
				break;
			}
		}
		this.batchPtr = 0;
		this.vertexPtr = 0;
		this.pointPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.curBuffer++;
		if (this.curBuffer >= MULTI_BUFFERS)
			this.curBuffer = 0;
	};
	GLWrap_.prototype.setOpacity = function (op)
	{
		if (op === this.lastOpacity)
			return;
		var b = this.pushBatch();
		b.type = BATCH_SETOPACITY;
		b.opacityParam = op;
		this.lastOpacity = op;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setTexture = function (tex)
	{
		if (tex === this.lastTexture)
			return;
		var b = this.pushBatch();
		b.type = BATCH_SETTEXTURE;
		b.texParam = tex;
		this.lastTexture = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setBlend = function (s, d)
	{
		if (s === this.lastSrcBlend && d === this.lastDestBlend)
			return;
		var b = this.pushBatch();
		b.type = BATCH_SETBLEND;
		b.startIndex = s;		// recycle params to save memory
		b.indexCount = d;
		this.lastSrcBlend = s;
		this.lastDestBlend = d;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setAlphaBlend = function ()
	{
		this.setBlend(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
	};
	var LAST_VERTEX = MAX_VERTICES * 2 - 8;
	GLWrap_.prototype.quad = function(tlx, tly, trx, try_, brx, bry, blx, bly)
	{
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		if (this.hasQuadBatchTop)
		{
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else
		{
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = (v / 4) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		vd[v] = tlx;
		td[v++] = 0;
		vd[v] = tly;
		td[v++] = 0;
		vd[v] = trx;
		td[v++] = 1;
		vd[v] = try_;
		td[v++] = 0;
		vd[v] = brx;
		td[v++] = 1;
		vd[v] = bry;
		td[v++] = 1;
		vd[v] = blx;
		td[v++] = 0;
		vd[v] = bly;
		td[v++] = 1;
		this.vertexPtr = v;
	};
	GLWrap_.prototype.quadTex = function(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex)
	{
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		if (this.hasQuadBatchTop)
		{
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else
		{
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = (v / 4) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		vd[v] = tlx;
		td[v++] = rcTex.left;
		vd[v] = tly;
		td[v++] = rcTex.top;
		vd[v] = trx;
		td[v++] = rcTex.right;
		vd[v] = try_;
		td[v++] = rcTex.top;
		vd[v] = brx;
		td[v++] = rcTex.right;
		vd[v] = bry;
		td[v++] = rcTex.bottom;
		vd[v] = blx;
		td[v++] = rcTex.left;
		vd[v] = bly;
		td[v++] = rcTex.bottom;
		this.vertexPtr = v;
	};
	var LAST_POINT = MAX_POINTS - 4;
	GLWrap_.prototype.point = function(x_, y_, size_, opacity_)
	{
		if (this.pointPtr >= LAST_POINT)
			this.endBatch();
		var p = this.pointPtr;			// point cursor
		var pd = this.pointData;		// point data array
		if (this.hasPointBatchTop)
		{
			this.batch[this.batchPtr - 1].indexCount++;
		}
		else
		{
			var b = this.pushBatch();
			b.type = BATCH_POINTS;
			b.startIndex = p;
			b.indexCount = 1;
			this.hasPointBatchTop = true;
			this.hasQuadBatchTop = false;
		}
		pd[p++] = x_;
		pd[p++] = y_;
		pd[p++] = size_;
		pd[p++] = opacity_;
		this.pointPtr = p;
	};
	GLWrap_.prototype.switchProgram = function (progIndex)
	{
		if (this.lastProgram === progIndex)
			return;			// no change
		var shaderProg = this.shaderPrograms[progIndex];
		if (!shaderProg)
		{
			if (this.lastProgram === 0)
				return;								// already on default shader
			progIndex = 0;
			shaderProg = this.shaderPrograms[0];
		}
		var b = this.pushBatch();
		b.type = BATCH_SETPROGRAM;
		b.startIndex = progIndex;
		this.lastProgram = progIndex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.programUsesDest = function (progIndex)
	{
		var s = this.shaderPrograms[progIndex];
		return !!(s.locDestStart || s.locDestEnd);
	};
	GLWrap_.prototype.programUsesCrossSampling = function (progIndex)
	{
		return this.shaderPrograms[progIndex].crossSampling;
	};
	GLWrap_.prototype.programExtendsBox = function (progIndex)
	{
		var s = this.shaderPrograms[progIndex];
		return s.extendBoxHorizontal !== 0 || s.extendBoxVertical !== 0;
	};
	GLWrap_.prototype.getProgramBoxExtendHorizontal = function (progIndex)
	{
		return this.shaderPrograms[progIndex].extendBoxHorizontal;
	};
	GLWrap_.prototype.getProgramBoxExtendVertical = function (progIndex)
	{
		return this.shaderPrograms[progIndex].extendBoxVertical;
	};
	GLWrap_.prototype.getProgramParameterType = function (progIndex, paramIndex)
	{
		return this.shaderPrograms[progIndex].parameters[paramIndex][2];
	};
	GLWrap_.prototype.programIsAnimated = function (progIndex)
	{
		return this.shaderPrograms[progIndex].animated;
	};
	GLWrap_.prototype.setProgramParameters = function (backTex, pixelWidth, pixelHeight, destStartX, destStartY, destEndX, destEndY, layerScale, params)
	{
		var i, len, s = this.shaderPrograms[this.lastProgram];
		if (s.locPixelWidth || s.locPixelHeight || s.locSeconds || s.locSamplerBack ||
			s.locDestStart || s.locDestEnd || s.locLayerScale || params.length)
		{
			var b = this.pushBatch();
			b.type = BATCH_SETPROGRAMPARAMETERS;
			if (b.mat4param)
				mat4.set(this.matMV, b.mat4param);
			else
				b.mat4param = mat4.create();
			b.mat4param[0] = pixelWidth;
			b.mat4param[1] = pixelHeight;
			b.mat4param[2] = destStartX;
			b.mat4param[3] = destStartY;
			b.mat4param[4] = destEndX;
			b.mat4param[5] = destEndY;
			b.mat4param[6] = layerScale;
			b.texParam = backTex;
			if (params.length)
			{
				b.shaderParams.length = params.length;
				for (i = 0, len = params.length; i < len; i++)
					b.shaderParams[i] = params[i];
			}
			this.hasQuadBatchTop = false;
			this.hasPointBatchTop = false;
		}
	};
	GLWrap_.prototype.clear = function (r, g, b_, a)
	{
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 0;					// clear all mode
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = r;
		b.mat4param[1] = g;
		b.mat4param[2] = b_;
		b.mat4param[3] = a;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.clearRect = function (x, y, w, h)
	{
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 1;					// clear rect mode
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = x;
		b.mat4param[1] = y;
		b.mat4param[2] = w;
		b.mat4param[3] = h;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.present = function ()
	{
		this.endBatch();
		this.gl.flush();
		/*
		if (debugBatch)
		{
;
			debugBatch = false;
		}
		*/
	};
	function nextHighestPowerOfTwo(x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i;
		}
		return x + 1;
	}
	var all_textures = [];
	var textures_by_src = {};
	var BF_RGBA8 = 0;
	var BF_RGB8 = 1;
	var BF_RGBA4 = 2;
	var BF_RGB5_A1 = 3;
	var BF_RGB565 = 4;
	GLWrap_.prototype.loadTexture = function (img, tiling, linearsampling, pixelformat, tiletype)
	{
		tiling = !!tiling;
		linearsampling = !!linearsampling;
		var tex_key = img.src + "," + tiling + "," + linearsampling + (tiling ? ("," + tiletype) : "");
		var webGL_texture = null;
		if (typeof img.src !== "undefined" && textures_by_src.hasOwnProperty(tex_key))
		{
			webGL_texture = textures_by_src[tex_key];
			webGL_texture.c2refcount++;
			return webGL_texture;
		}
		this.endBatch();
;
		var gl = this.gl;
		var isPOT = (cr.isPOT(img.width) && cr.isPOT(img.height));
		webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		var internalformat = gl.RGBA;
		var format = gl.RGBA;
		var type = gl.UNSIGNED_BYTE;
		if (pixelformat)
		{
			switch (pixelformat) {
			case BF_RGB8:
				internalformat = gl.RGB;
				format = gl.RGB;
				break;
			case BF_RGBA4:
				type = gl.UNSIGNED_SHORT_4_4_4_4;
				break;
			case BF_RGB5_A1:
				type = gl.UNSIGNED_SHORT_5_5_5_1;
				break;
			case BF_RGB565:
				internalformat = gl.RGB;
				format = gl.RGB;
				type = gl.UNSIGNED_SHORT_5_6_5;
				break;
			}
		}
		if (!isPOT && tiling)
		{
			var canvas = document.createElement("canvas");
			canvas.width = nextHighestPowerOfTwo(img.width);
			canvas.height = nextHighestPowerOfTwo(img.height);
			var ctx = canvas.getContext("2d");
			ctx.drawImage(img,
						  0, 0, img.width, img.height,
						  0, 0, canvas.width, canvas.height);
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, canvas);
		}
		else
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, img);
		if (tiling)
		{
			if (tiletype === "repeat-x")
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			else if (tiletype === "repeat-y")
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			}
			else
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			}
		}
		else
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		if (linearsampling)
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			if (isPOT)
			{
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.generateMipmap(gl.TEXTURE_2D);
			}
			else
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
		else
		{
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture = null;
		webGL_texture.c2width = img.width;
		webGL_texture.c2height = img.height;
		webGL_texture.c2refcount = 1;
		webGL_texture.c2texkey = tex_key;
		all_textures.push(webGL_texture);
		textures_by_src[tex_key] = webGL_texture;
		return webGL_texture;
	};
	GLWrap_.prototype.createEmptyTexture = function (w, h, linearsampling, _16bit)
	{
		this.endBatch();
		var gl = this.gl;
		var webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, null);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture = null;
		webGL_texture.c2width = w;
		webGL_texture.c2height = h;
		all_textures.push(webGL_texture);
		return webGL_texture;
	};
	GLWrap_.prototype.videoToTexture = function (video_, texture_, _16bit)
	{
		this.endBatch();
		var gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture_);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, video_);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture = null;
	};
	GLWrap_.prototype.deleteTexture = function (tex)
	{
		if (!tex)
			return;
		if (typeof tex.c2refcount !== "undefined" && tex.c2refcount > 1)
		{
			tex.c2refcount--;
			return;
		}
		this.endBatch();
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		this.lastTexture = null;
		cr.arrayFindRemove(all_textures, tex);
		if (typeof tex.c2texkey !== "undefined")
			delete textures_by_src[tex.c2texkey];
		this.gl.deleteTexture(tex);
	};
	GLWrap_.prototype.estimateVRAM = function ()
	{
		var total = this.width * this.height * 4 * 2;
		var i, len, t;
		for (i = 0, len = all_textures.length; i < len; i++)
		{
			t = all_textures[i];
			total += (t.c2width * t.c2height * 4);
		}
		return total;
	};
	GLWrap_.prototype.textureCount = function ()
	{
		return all_textures.length;
	};
	GLWrap_.prototype.setRenderingToTexture = function (tex)
	{
		if (tex === this.renderToTex)
			return;
		var b = this.pushBatch();
		b.type = BATCH_RENDERTOTEXTURE;
		b.texParam = tex;
		this.renderToTex = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	cr.GLWrap = GLWrap_;
}());
;
(function()
{
	function Runtime(canvas)
	{
		if (!canvas || (!canvas.getContext && !canvas["dc"]))
			return;
		if (canvas["c2runtime"])
			return;
		else
			canvas["c2runtime"] = this;
		var self = this;
		this.isPhoneGap = (typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined"));
		this.isDirectCanvas = !!canvas["dc"];
		this.isAppMobi = (typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas);
		this.isCocoonJs = !!window["c2cocoonjs"];
		if (this.isCocoonJs)
		{
			CocoonJS["App"]["onSuspended"].addEventListener(function() {
				self["setSuspended"](true);
			});
			CocoonJS["App"]["onActivated"].addEventListener(function () {
				self["setSuspended"](false);
			});
		}
		this.isDomFree = this.isDirectCanvas || this.isCocoonJs;
		this.isTizen = /tizen/i.test(navigator.userAgent);
		this.isAndroid = /android/i.test(navigator.userAgent) && !this.isTizen;		// tizen says "like Android"
		this.isIE = /msie/i.test(navigator.userAgent);
		this.isiPhone = /iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent);	// treat ipod as an iphone
		this.isiPad = /ipad/i.test(navigator.userAgent);
		this.isiOS = this.isiPhone || this.isiPad;
		this.isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
		this.isSafari = !this.isChrome && /safari/i.test(navigator.userAgent);		// Chrome includes Safari in UA
		this.isWindows = /windows/i.test(navigator.userAgent);
		this.isNodeWebkit = (typeof window["c2nodewebkit"] !== "undefined");
		this.isArcade = (typeof window["is_scirra_arcade"] !== "undefined");
		this.isWindows8App = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.isWindowsPhone8 = !!(typeof window["c2isWindowsPhone8"] !== "undefined" && window["c2isWindowsPhone8"]);
		this.isBlackberry10 = !!(typeof window["c2isBlackberry10"] !== "undefined" && window["c2isBlackberry10"]);
		this.devicePixelRatio = 1;
		this.isMobile = (this.isPhoneGap || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS || this.isWindowsPhone8 || this.isBlackberry10 || this.isTizen);
		if (!this.isMobile)
			this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet)/i.test(navigator.userAgent);
		if (typeof cr_is_preview !== "undefined" && !this.isNodeWebkit && (window.location.search === "?nw" || /nodewebkit/i.test(navigator.userAgent)))
		{
			this.isNodeWebkit = true;
		}
		this.isDebug = (typeof cr_is_preview !== "undefined" && window.location.search.indexOf("debug") > -1)
		this.canvas = canvas;
		this.canvasdiv = document.getElementById("c2canvasdiv");
		this.gl = null;
		this.glwrap = null;
		this.ctx = null;
		this.canvas.oncontextmenu = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
		this.canvas.onselectstart = function (e) { if (e.preventDefault) e.preventDefault(); return false; };
		if (this.isDirectCanvas)
			window["c2runtime"] = this;
		if (this.isNodeWebkit)
		{
			window.ondragover = function(e) { e.preventDefault(); return false; };
			window.ondrop = function(e) { e.preventDefault(); return false; };
		}
		this.width = canvas.width;
		this.height = canvas.height;
		this.lastwidth = this.width;
		this.lastheight = this.height;
		this.redraw = true;
		this.isSuspended = false;
		if (!Date.now) {
		  Date.now = function now() {
			return +new Date();
		  };
		}
		this.plugins = [];
		this.types = {};
		this.types_by_index = [];
		this.behaviors = [];
		this.layouts = {};
		this.layouts_by_index = [];
		this.eventsheets = {};
		this.eventsheets_by_index = [];
		this.wait_for_textures = [];        // for blocking until textures loaded
		this.triggers_to_postinit = [];
		this.all_global_vars = [];
		this.all_local_vars = [];
		this.deathRow = new cr.ObjectSet();
		this.isInClearDeathRow = false;
		this.isInOnDestroy = 0;					// needs to support recursion so increments and decrements and is true if > 0
		this.isRunningEvents = false;
		this.createRow = [];
		this.isLoadingState = false;
		this.saveToSlot = "";
		this.loadFromSlot = "";
		this.loadFromJson = "";
		this.lastSaveJson = "";
		this.signalledContinuousPreview = false;
		this.suspendDrawing = false;		// for hiding display until continuous preview loads
		this.dt = 0;
        this.dt1 = 0;
		this.logictime = 0;			// used to calculate CPUUtilisation
		this.cpuutilisation = 0;
		this.zeroDtCount = 0;
        this.timescale = 1.0;
        this.kahanTime = new cr.KahanAdder();
		this.last_tick_time = 0;
		this.measuring_dt = true;
		this.fps = 0;
		this.last_fps_time = 0;
		this.tickcount = 0;
		this.execcount = 0;
		this.framecount = 0;        // for fps
		this.objectcount = 0;
		this.changelayout = null;
		this.destroycallbacks = [];
		this.event_stack = [];
		this.event_stack_index = -1;
		this.localvar_stack = [[]];
		this.localvar_stack_index = 0;
		this.trigger_depth = 0;		// recursion depth for triggers
		this.pushEventStack(null);
		this.loop_stack = [];
		this.loop_stack_index = -1;
		this.next_uid = 0;
		this.next_puid = 0;		// permanent unique ids
		this.layout_first_tick = true;
		this.family_count = 0;
		this.suspend_events = [];
		this.raf_id = 0;
		this.timeout_id = 0;
		this.isloading = true;
		this.loadingprogress = 0;
		this.isNodeFullscreen = false;
		this.stackLocalCount = 0;	// number of stack-based local vars for recursion
		this.had_a_click = false;
        this.objects_to_tick = new cr.ObjectSet();
		this.objects_to_tick2 = new cr.ObjectSet();
		this.registered_collisions = [];
		this.temp_poly = new cr.CollisionPoly([]);
		this.temp_poly2 = new cr.CollisionPoly([]);
		this.allGroups = [];				// array of all event groups
        this.activeGroups = {};				// event group activation states
		this.cndsBySid = {};
		this.actsBySid = {};
		this.varsBySid = {};
		this.blocksBySid = {};
		this.running_layout = null;			// currently running layout
		this.layer_canvas = null;			// for layers "render-to-texture"
		this.layer_ctx = null;
		this.layer_tex = null;
		this.layout_tex = null;
		this.is_WebGL_context_lost = false;
		this.uses_background_blending = false;	// if any shader uses background blending, so entire layout renders to texture
		this.fx_tex = [null, null];
		this.fullscreen_scaling = 0;
		this.files_subfolder = "";			// path with project files
		this.objectsByUid = {};				// maps every in-use UID (as a string) to its instance
		this.loaderlogo = null;
		this.snapshotCanvas = null;
		this.snapshotData = "";
		this.load();
		this.isRetina = (!this.isDomFree && this.useiOSRetina && (this.isiOS || this.isTizen));
		this.devicePixelRatio = (this.isRetina ? (window["devicePixelRatio"] || 1) : 1);
		this.ClearDeathRow();
		var attribs;
		if (typeof jQuery !== "undefined" && this.fullscreen_mode > 0)
			this["setSize"](jQuery(window).width(), jQuery(window).height());
		try {
			if (this.enableWebGL && (this.isCocoonJs || !this.isDomFree))
			{
				attribs = { "depth": false, "antialias": !this.isMobile };
				var use_webgl = true;
				if (this.isChrome && this.isWindows)
				{
					var tempcanvas = document.createElement("canvas");
					var tempgl = (tempcanvas.getContext("webgl", attribs) || tempcanvas.getContext("experimental-webgl", attribs));
					if (tempgl.getSupportedExtensions().toString() === "OES_texture_float,OES_standard_derivatives,WEBKIT_WEBGL_lose_context")
					{
;
						use_webgl = false;
					}
				}
				if (use_webgl)
					this.gl = (canvas.getContext("webgl", attribs) || canvas.getContext("experimental-webgl", attribs));
			}
		}
		catch (e) {
		}
		if (this.gl)
		{
;
			if (!this.isDomFree)
			{
				this.overlay_canvas = document.createElement("canvas");
				jQuery(this.overlay_canvas).appendTo(this.canvas.parentNode);
				this.overlay_canvas.oncontextmenu = function (e) { return false; };
				this.overlay_canvas.onselectstart = function (e) { return false; };
				this.overlay_canvas.width = canvas.width;
				this.overlay_canvas.height = canvas.height;
				this.positionOverlayCanvas();
				this.overlay_ctx = this.overlay_canvas.getContext("2d");
			}
			this.glwrap = new cr.GLWrap(this.gl, this.isMobile);
			this.glwrap.setSize(canvas.width, canvas.height);
			this.ctx = null;
			this.canvas.addEventListener("webglcontextlost", function (ev) {
				ev.preventDefault();
				self.onContextLost();
				window["cr_setSuspended"](true);		// stop rendering
			}, false);
			this.canvas.addEventListener("webglcontextrestored", function (ev) {
				self.glwrap.initState();
				self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
				self.layer_tex = null;
				self.layout_tex = null;
				self.fx_tex[0] = null;
				self.fx_tex[1] = null;
				self.onContextRestored();
				self.redraw = true;
				window["cr_setSuspended"](false);		// resume rendering
			}, false);
			var i, len, j, lenj, k, lenk, t, s, l, y;
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
				{
					s = t.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
				}
			}
			for (i = 0, len = this.layouts_by_index.length; i < len; i++)
			{
				l = this.layouts_by_index[i];
				for (j = 0, lenj = l.effect_types.length; j < lenj; j++)
				{
					s = l.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
				}
				for (j = 0, lenj = l.layers.length; j < lenj; j++)
				{
					y = l.layers[j];
					for (k = 0, lenk = y.effect_types.length; k < lenk; k++)
					{
						s = y.effect_types[k];
						s.shaderindex = this.glwrap.getShaderIndex(s.id);
						this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
					}
				}
			}
		}
		else
		{
			if (this.fullscreen_mode > 0 && this.isDirectCanvas)
			{
;
				this.canvas = null;
				document.oncontextmenu = function (e) { return false; };
				document.onselectstart = function (e) { return false; };
				this.ctx = AppMobi["canvas"]["getContext"]("2d");
				try {
					this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
					this.ctx["globalScale"] = 1;
					this.ctx["HTML5CompatibilityMode"] = true;
				} catch(e){}
				if (this.width !== 0 && this.height !== 0)
				{
					this.ctx.width = this.width;
					this.ctx.height = this.height;
				}
			}
			if (!this.ctx)
			{
;
				if (this.isCocoonJs)
				{
					attribs = { "antialias" : !!this.linearSampling };
					this.ctx = canvas.getContext("2d", attribs);
				}
				else
					this.ctx = canvas.getContext("2d");
				this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
				this.ctx["imageSmoothingEnabled"] = this.linearSampling;
			}
			this.overlay_canvas = null;
			this.overlay_ctx = null;
		}
		this.tickFunc = function () { self.tick(); };
		if (window != window.top && !this.isDomFree && !this.isWindows8App)
		{
			document.addEventListener("mousedown", function () {
				window.focus();
			}, true);
			document.addEventListener("touchstart", function () {
				window.focus();
			}, true);
		}
		if (typeof cr_is_preview !== "undefined")
		{
			if (this.isCocoonJs)
				console.log("[Construct 2] In preview-over-wifi via CocoonJS mode");
			if (window.location.search.indexOf("continuous") > -1)
			{
				cr.logexport("Reloading for continuous preview");
				this.loadFromSlot = "__c2_continuouspreview";
				this.suspendDrawing = true;
			}
			if (this.pauseOnBlur && !this.isMobile)
			{
				jQuery(window).focus(function ()
				{
					self["setSuspended"](false);
				});
				jQuery(window).blur(function ()
				{
					self["setSuspended"](true);
				});
			}
		}
		this.go();			// run loading screen
		this.extra = {};
		cr.seal(this);
	};
	var webkitRepaintFlag = false;
	Runtime.prototype["setSize"] = function (w, h)
	{
		var tryHideAddressBar = this.hideAddressBar && this.isiPhone && !navigator["standalone"] && !this.isDomFree && !this.isPhoneGap;
		var addressBarHeight = 0;
		if (tryHideAddressBar)
		{
			if (this.isiPhone)
				addressBarHeight = 60;
			else if (this.isAndroid)
				addressBarHeight = 56;
			h += addressBarHeight;
		}
		var offx = 0, offy = 0;
		var neww = 0, newh = 0, intscale = 0;
		var mode = this.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isNodeFullscreen);
		if (isfullscreen && this.fullscreen_scaling > 0)
			mode = this.fullscreen_scaling;
		if (mode >= 4)
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = w / h;
			if (cur_aspect > orig_aspect)
			{
				neww = h * orig_aspect;
				if (mode === 5)	// integer scaling
				{
					intscale = neww / this.original_width;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale;
					newh = this.original_height * intscale;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else
				{
					offx = (w - neww) / 2;
					w = neww;
				}
			}
			else
			{
				newh = w / orig_aspect;
				if (mode === 5)	// integer scaling
				{
					intscale = newh / this.original_height;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale;
					newh = this.original_height * intscale;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else
				{
					offy = (h - newh) / 2;
					h = newh;
				}
			}
			if (isfullscreen && !this.isNodeWebkit)
			{
				offx = 0;
				offy = 0;
			}
			offx = Math.floor(offx);
			offy = Math.floor(offy);
			w = Math.floor(w);
			h = Math.floor(h);
		}
		else if (this.isNodeWebkit && this.isNodeFullscreen && this.fullscreen_mode_set === 0)
		{
			offx = Math.floor((w - this.original_width) / 2);
			offy = Math.floor((h - this.original_height) / 2);
			w = this.original_width;
			h = this.original_height;
		}
		if (this.isRetina && this.isiPad && this.devicePixelRatio > 1)	// don't apply to iPad 1-2
		{
			if (w >= 1024)
				w = 1023;		// 2046 retina pixels
			if (h >= 1024)
				h = 1023;
		}
		var multiplier = this.devicePixelRatio;
		this.width = w * multiplier;
		this.height = h * multiplier;
		this.redraw = true;
		if (this.canvasdiv && !this.isDomFree)
		{
			jQuery(this.canvasdiv).css({"width": w + "px",
										"height": h + "px",
										"margin-left": offx,
										"margin-top": offy});
			if (typeof cr_is_preview !== "undefined")
			{
				jQuery("#borderwrap").css({"width": w + "px",
											"height": h + "px"});
			}
		}
		if (this.canvas)
		{
			this.canvas.width = w * multiplier;
			this.canvas.height = h * multiplier;
			if (this.isRetina)
			{
				jQuery(this.canvas).css({"width": w + "px",
										"height": h + "px"});
			}
		}
		if (this.overlay_canvas)
		{
			this.overlay_canvas.width = w;
			this.overlay_canvas.height = h;
		}
		if (this.glwrap)
			this.glwrap.setSize(w, h);
		if (this.isDirectCanvas && this.ctx)
		{
			this.ctx.width = w;
			this.ctx.height = h;
		}
		if (this.ctx)
		{
			this.ctx["webkitImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["mozImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["msImageSmoothingEnabled"] = this.linearSampling;
			this.ctx["imageSmoothingEnabled"] = this.linearSampling;
		}
		if (tryHideAddressBar && addressBarHeight > 0)
		{
			window.setTimeout(function () {
				window.scrollTo(0, 1);
			}, 100);
		}
	};
	Runtime.prototype.onContextLost = function ()
	{
		this.is_WebGL_context_lost = true;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onLostWebGLContext)
				t.onLostWebGLContext();
		}
	};
	Runtime.prototype.onContextRestored = function ()
	{
		this.is_WebGL_context_lost = false;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			t = this.types_by_index[i];
			if (t.onRestoreWebGLContext)
				t.onRestoreWebGLContext();
		}
	};
	Runtime.prototype.positionOverlayCanvas = function()
	{
		if (this.isDomFree)
			return;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isNodeFullscreen);
		var overlay_position = isfullscreen ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
		overlay_position.position = "absolute";
		jQuery(this.overlay_canvas).css(overlay_position);
	};
	var caf = window["cancelAnimationFrame"] ||
	  window["mozCancelAnimationFrame"]    ||
	  window["webkitCancelAnimationFrame"] ||
	  window["msCancelAnimationFrame"]     ||
	  window["oCancelAnimationFrame"];
	Runtime.prototype["setSuspended"] = function (s)
	{
		var i, len;
		if (s && !this.isSuspended)
		{
			cr.logexport("[Construct 2] Suspending");
			this.isSuspended = true;			// next tick will be last
			if (this.raf_id !== 0 && caf)		// note: CocoonJS does not implement cancelAnimationFrame
				caf(this.raf_id);
			if (this.timeout_id !== 0)
				clearTimeout(this.timeout_id);
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](true);
		}
		else if (!s && this.isSuspended)
		{
			cr.logexport("[Construct 2] Resuming");
			this.isSuspended = false;
			this.last_tick_time = cr.performance_now();	// ensure first tick is a zero-dt one
			this.last_fps_time = cr.performance_now();	// reset FPS counter
			this.framecount = 0;
			this.logictime = 0;
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](false);
			this.tick();						// kick off runtime again
		}
	};
	Runtime.prototype.addSuspendCallback = function (f)
	{
		this.suspend_events.push(f);
	};
	Runtime.prototype.load = function ()
	{
;
		var pm = cr.getProjectModel();
		this.name = pm[0];
		this.first_layout = pm[1];
		this.fullscreen_mode = pm[11];	// 0 = off, 1 = crop, 2 = scale inner, 3 = scale outer, 4 = letterbox scale, 5 = integer letterbox scale
		this.fullscreen_mode_set = pm[11];
		if (this.isDomFree && (pm[11] >= 4 || pm[11] === 0))
		{
			cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale outer'");
			this.fullscreen_mode = 3;
			this.fullscreen_mode_set = 3;
		}
		this.uses_loader_layout = pm[17];
		this.loaderstyle = pm[18];
		if (this.loaderstyle === 0)
		{
			this.loaderlogo = new Image();
			this.loaderlogo.src = pathGame + "loading-logo.png";
		}
		this.next_uid = pm[20];
		this.system = new cr.system_object(this);
		var i, len, j, lenj, k, lenk, idstr, m, b, t, f;
		var plugin, plugin_ctor;
		for (i = 0, len = pm[2].length; i < len; i++)
		{
			m = pm[2][i];
;
			cr.add_common_aces(m);
			plugin = new m[0](this);
			plugin.singleglobal = m[1];
			plugin.is_world = m[2];
			plugin.must_predraw = m[9];
			if (plugin.onCreate)
				plugin.onCreate();  // opportunity to override default ACEs
			cr.seal(plugin);
			this.plugins.push(plugin);
		}
		pm = cr.getProjectModel();
		for (i = 0, len = pm[3].length; i < len; i++)
		{
			m = pm[3][i];
			plugin_ctor = m[1];
;
			plugin = null;
			for (j = 0, lenj = this.plugins.length; j < lenj; j++)
			{
				if (this.plugins[j] instanceof plugin_ctor)
				{
					plugin = this.plugins[j];
					break;
				}
			}
;
;
			var type_inst = new plugin.Type(plugin);
;
			type_inst.name = m[0];
			type_inst.is_family = m[2];
			type_inst.instvar_sids = m[3].slice(0);
			type_inst.vars_count = m[3].length;
			type_inst.behs_count = m[4];
			type_inst.fx_count = m[5];
			type_inst.sid = m[11];
			if (type_inst.is_family)
			{
				type_inst.members = [];				// types in this family
				type_inst.family_index = this.family_count++;
				type_inst.families = null;
			}
			else
			{
				type_inst.members = null;
				type_inst.family_index = -1;
				type_inst.families = [];			// families this type belongs to
			}
			type_inst.family_var_map = null;
			type_inst.family_beh_map = null;
			type_inst.family_fx_map = null;
			type_inst.is_contained = false;
			type_inst.container = null;
			if (m[6])
			{
				type_inst.texture_file = m[6][0];
				type_inst.texture_filesize = m[6][1];
				type_inst.texture_pixelformat = m[6][2];
			}
			else
			{
				type_inst.texture_file = null;
				type_inst.texture_filesize = 0;
				type_inst.texture_pixelformat = 0;		// rgba8
			}
			if (m[7])
			{
				type_inst.animations = m[7];
			}
			else
			{
				type_inst.animations = null;
			}
			type_inst.index = i;                                // save index in to types array in type
			type_inst.instances = [];                           // all instances of this type
			type_inst.deadCache = [];							// destroyed instances to recycle next create
			type_inst.solstack = [new cr.selection(type_inst)]; // initialise SOL stack with one empty SOL
			type_inst.cur_sol = 0;
			type_inst.default_instance = null;
			type_inst.stale_iids = true;
			type_inst.updateIIDs = cr.type_updateIIDs;
			type_inst.getFirstPicked = cr.type_getFirstPicked;
			type_inst.getPairedInstance = cr.type_getPairedInstance;
			type_inst.getCurrentSol = cr.type_getCurrentSol;
			type_inst.pushCleanSol = cr.type_pushCleanSol;
			type_inst.pushCopySol = cr.type_pushCopySol;
			type_inst.popSol = cr.type_popSol;
			type_inst.getBehaviorByName = cr.type_getBehaviorByName;
			type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
			type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
			type_inst.applySolToContainer = cr.type_applySolToContainer;
			type_inst.extra = {};
			type_inst.toString = cr.type_toString;
			type_inst.behaviors = [];
			for (j = 0, lenj = m[8].length; j < lenj; j++)
			{
				b = m[8][j];
				var behavior_ctor = b[1];
				var behavior_plugin = null;
				for (k = 0, lenk = this.behaviors.length; k < lenk; k++)
				{
					if (this.behaviors[k] instanceof behavior_ctor)
					{
						behavior_plugin = this.behaviors[k];
						break;
					}
				}
				if (!behavior_plugin)
				{
					behavior_plugin = new behavior_ctor(this);
					behavior_plugin.my_instances = new cr.ObjectSet(); 	// instances of this behavior
					if (behavior_plugin.onCreate)
						behavior_plugin.onCreate();
					cr.seal(behavior_plugin);
					this.behaviors.push(behavior_plugin);
				}
				var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
				behavior_type.name = b[0];
				behavior_type.sid = b[2];
				behavior_type.onCreate();
				cr.seal(behavior_type);
				type_inst.behaviors.push(behavior_type);
			}
			type_inst.global = m[9];
			type_inst.isOnLoaderLayout = m[10];
			type_inst.effect_types = [];
			for (j = 0, lenj = m[12].length; j < lenj; j++)
			{
				type_inst.effect_types.push({
					id: m[12][j][0],
					name: m[12][j][1],
					shaderindex: -1,
					active: true,
					index: j
				});
			}
			if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world)
			{
				type_inst.onCreate();
				cr.seal(type_inst);
			}
			if (type_inst.name)
				this.types[type_inst.name] = type_inst;
			this.types_by_index.push(type_inst);
			if (plugin.singleglobal)
			{
				var instance = new plugin.Instance(type_inst);
				instance.uid = this.next_uid++;
				instance.puid = this.next_puid++;
				instance.iid = 0;
				instance.get_iid = cr.inst_get_iid;
				instance.toString = cr.inst_toString;
				instance.properties = m[13];
				instance.onCreate();
				cr.seal(instance);
				type_inst.instances.push(instance);
				this.objectsByUid[instance.uid.toString()] = instance;
			}
		}
		for (i = 0, len = pm[4].length; i < len; i++)
		{
			var familydata = pm[4][i];
			var familytype = this.types_by_index[familydata[0]];
			var familymember;
			for (j = 1, lenj = familydata.length; j < lenj; j++)
			{
				familymember = this.types_by_index[familydata[j]];
				familymember.families.push(familytype);
				familytype.members.push(familymember);
			}
		}
		for (i = 0, len = pm[22].length; i < len; i++)
		{
			var containerdata = pm[22][i];
			var containertypes = [];
			for (j = 0, lenj = containerdata.length; j < lenj; j++)
				containertypes.push(this.types_by_index[containerdata[j]]);
			for (j = 0, lenj = containertypes.length; j < lenj; j++)
			{
				containertypes[j].is_contained = true;
				containertypes[j].container = containertypes;
			}
		}
		if (this.family_count > 0)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				if (t.is_family || !t.families.length)
					continue;
				t.family_var_map = new Array(this.family_count);
				t.family_beh_map = new Array(this.family_count);
				t.family_fx_map = new Array(this.family_count);
				var all_fx = [];
				var varsum = 0;
				var behsum = 0;
				var fxsum = 0;
				for (j = 0, lenj = t.families.length; j < lenj; j++)
				{
					f = t.families[j];
					t.family_var_map[f.family_index] = varsum;
					varsum += f.vars_count;
					t.family_beh_map[f.family_index] = behsum;
					behsum += f.behs_count;
					t.family_fx_map[f.family_index] = fxsum;
					fxsum += f.fx_count;
					for (k = 0, lenk = f.effect_types.length; k < lenk; k++)
						all_fx.push(cr.shallowCopy({}, f.effect_types[k]));
				}
				t.effect_types = all_fx.concat(t.effect_types);
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
					t.effect_types[j].index = j;
			}
		}
		for (i = 0, len = pm[5].length; i < len; i++)
		{
			m = pm[5][i];
			var layout = new cr.layout(this, m);
			cr.seal(layout);
			this.layouts[layout.name] = layout;
			this.layouts_by_index.push(layout);
		}
		for (i = 0, len = pm[6].length; i < len; i++)
		{
			m = pm[6][i];
			var sheet = new cr.eventsheet(this, m);
			cr.seal(sheet);
			this.eventsheets[sheet.name] = sheet;
			this.eventsheets_by_index.push(sheet);
		}
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
			this.eventsheets_by_index[i].postInit();
		for (i = 0, len = this.triggers_to_postinit.length; i < len; i++)
			this.triggers_to_postinit[i].postInit();
		this.triggers_to_postinit.length = 0;
		this.files_subfolder = pm[7];
		this.pixel_rounding = pm[8];
		this.original_width = pm[9];
		this.original_height = pm[10];
		this.aspect_scale = 1.0;
		this.enableWebGL = pm[12];
		this.linearSampling = pm[13];
		this.clearBackground = pm[14];
		this.versionstr = pm[15];
		var iOSretina = pm[16];
		if (iOSretina === 2)
			iOSretina = (this.isiPhone ? 1 : 0);
		this.useiOSRetina = (iOSretina !== 0);
		this.hideAddressBar = pm[19];
		this.pauseOnBlur = pm[21];
		this.start_time = Date.now();
	};
	Runtime.prototype.findWaitingTexture = function (src_)
	{
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++)
		{
			if (this.wait_for_textures[i].cr_src === src_)
				return this.wait_for_textures[i];
		}
		return null;
	};
	Runtime.prototype.areAllTexturesLoaded = function ()
	{
		var totalsize = 0;
		var completedsize = 0;
		var ret = true;
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++)
		{
			var filesize = this.wait_for_textures[i].cr_filesize;
			if (!filesize || filesize <= 0)
				filesize = 50000;
			totalsize += filesize;
			if (this.wait_for_textures[i].complete || this.wait_for_textures[i]["loaded"])
				completedsize += filesize;
			else
				ret = false;    // not all textures loaded
		}
		if (totalsize == 0)
			this.progress = 0;
		else
			this.progress = (completedsize / totalsize);
		return ret;
	};
	Runtime.prototype.go = function ()
	{
		if (!this.ctx && !this.glwrap)
			return;
		var ctx = this.ctx || this.overlay_ctx;
		if (this.overlay_canvas)
			this.positionOverlayCanvas();
		this.progress = 0;
		this.last_progress = -1;
		if (this.areAllTexturesLoaded())
			this.go_textures_done();
		else
		{
			var ms_elapsed = Date.now() - this.start_time;
			var multiplier = 1;
			if (this.isTizen)
				multiplier = this.devicePixelRatio;
			if (ctx)
			{
				if (this.loaderstyle !== 3 && ms_elapsed >= 500 && this.last_progress != this.progress)
				{
					ctx.clearRect(0, 0, this.width, this.height);
					var mx = this.width / (2 * multiplier);
					var my = this.height / (2 * multiplier);
					var haslogo = (this.loaderstyle === 0 && this.loaderlogo.complete);
					var hlw = 40;
					var hlh = 0;
					var logowidth = 80;
					if (haslogo)
					{
						logowidth = this.loaderlogo.width;
						hlw = logowidth / 2;
						hlh = this.loaderlogo.height / 2;
						ctx.drawImage(this.loaderlogo, cr.floor(mx - hlw), cr.floor(my - hlh));
					}
					if (this.loaderstyle <= 1)
					{
						my += hlh + (haslogo ? 12 : 0);
						mx -= hlw;
						mx = cr.floor(mx) + 0.5;
						my = cr.floor(my) + 0.5;
						ctx.fillStyle = "DodgerBlue";
						ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6);
						ctx.strokeStyle = "black";
						ctx.strokeRect(mx, my, logowidth, 6);
						ctx.strokeStyle = "white";
						ctx.strokeRect(mx - 1, my - 1, logowidth + 2, 8);
					}
					else if (this.loaderstyle === 2)
					{
						ctx.font = "12pt Arial";
						ctx.fillStyle = "#999";
						ctx.textBaseLine = "middle";
						var percent_text = Math.round(this.progress * 100) + "%";
						var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
						var text_width = text_dim ? text_dim.width : 0;
						ctx.fillText(percent_text, mx - (text_width / 2), my);
					}
				}
				this.last_progress = this.progress;
			}
			setTimeout((function (self) { return function () { self.go(); }; })(this), 100);
		}
	};
	Runtime.prototype.go_textures_done = function ()
	{
		if (this.overlay_canvas)
		{
			this.canvas.parentNode.removeChild(this.overlay_canvas);
			this.overlay_ctx = null;
			this.overlay_canvas = null;
		}
		this.start_time = Date.now();
		this.last_fps_time = cr.performance_now();       // for counting framerate
		var i, len, t;
		if (this.uses_loader_layout)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				t = this.types_by_index[i];
				if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world)
				{
					t.onCreate();
					cr.seal(t);
				}
			}
		}
		else
			this.isloading = false;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			this.layouts_by_index[i].createGlobalNonWorlds();
		}
		if (this.fullscreen_mode >= 2)
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			if ((this.fullscreen_mode !== 2 && cur_aspect > orig_aspect) || (this.fullscreen_mode === 2 && cur_aspect < orig_aspect))
				this.aspect_scale = this.height / this.original_height;
			else
				this.aspect_scale = this.width / this.original_width;
		}
		if (this.first_layout)
			this.layouts[this.first_layout].startRunning();
		else
			this.layouts_by_index[0].startRunning();
;
		if (!this.uses_loader_layout)
		{
			this.loadingprogress = 1;
			this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
		}
		this.tick();
		if (this.isDirectCanvas)
			AppMobi["webview"]["execute"]("onGameReady();");
	};
	var raf = window["requestAnimationFrame"] ||
	  window["mozRequestAnimationFrame"]    ||
	  window["webkitRequestAnimationFrame"] ||
	  window["msRequestAnimationFrame"]     ||
	  window["oRequestAnimationFrame"];
	Runtime.prototype.tick = function ()
	{
		if (!this.running_layout)
			return;
		var logic_start = cr.performance_now();
		if (this.isArcade)
		{
			var curwidth = jQuery(window).width();
			var curheight = jQuery(window).height();
			if (this.lastwidth !== curwidth || this.lastheight !== curheight)
			{
				this.lastwidth = curwidth;
				this.lastheight = curheight;
				this["setSize"](curwidth, curheight);
			}
		}
		if (this.isloading)
		{
			var done = this.areAllTexturesLoaded();		// updates this.progress
			this.loadingprogress = this.progress;
			if (done)
			{
				this.isloading = false;
				this.progress = 1;
				this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
			}
		}
		this.logic();
		if ((this.redraw || this.isCocoonJs) && !this.is_WebGL_context_lost && !this.suspendDrawing)
		{
			this.redraw = false;
			if (this.glwrap)
				this.drawGL();
			else
				this.draw();
			if (this.snapshotCanvas)
			{
				if (this.canvas && this.canvas.toDataURL)
				{
					this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
					this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
				}
				this.snapshotCanvas = null;
			}
		}
		this.tickcount++;
		this.execcount++;
		this.framecount++;
		this.logictime += cr.performance_now() - logic_start;
		if (this.isSuspended)
			return;
		if (raf)
			this.raf_id = raf(this.tickFunc, this.canvas);
		else
		{
			this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
		}
	};
	Runtime.prototype.logic = function ()
	{
		var i, leni, j, lenj, k, lenk, type, inst, binst;
		var cur_time = cr.performance_now();
		if (cur_time - this.last_fps_time >= 1000)  // every 1 second
		{
			this.last_fps_time += 1000;
			this.fps = this.framecount;
			this.framecount = 0;
			this.cpuutilisation = this.logictime;
			this.logictime = 0;
		}
		if (this.measuring_dt)
		{
			if (this.last_tick_time !== 0)
			{
				var ms_diff = cur_time - this.last_tick_time;
				if (ms_diff === 0 && !this.isDebug)
				{
					this.zeroDtCount++;
					if (this.zeroDtCout >= 10)
						this.measuring_dt = false;
					this.dt1 = 1.0 / 60.0;            // 60fps assumed (0.01666...)
				}
				else
				{
					this.dt1 = ms_diff / 1000.0; // dt measured in seconds
					if (this.dt1 > 0.5)
						this.dt1 = 0;
					else if (this.dt1 > 0.1)
						this.dt1 = 0.1;
				}
			}
			this.last_tick_time = cur_time;
		}
        this.dt = this.dt1 * this.timescale;
        this.kahanTime.add(this.dt);
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.isNodeFullscreen);
		if (this.fullscreen_mode >= 2 /* scale */ || (isfullscreen && this.fullscreen_scaling > 0))
		{
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			var mode = this.fullscreen_mode;
			if (isfullscreen && this.fullscreen_scaling > 0)
				mode = this.fullscreen_scaling;
			if ((mode !== 2 && cur_aspect > orig_aspect) || (mode === 2 && cur_aspect < orig_aspect))
			{
				this.aspect_scale = this.height / this.original_height;
			}
			else
			{
				this.aspect_scale = this.width / this.original_width;
			}
			if (this.running_layout)
			{
				this.running_layout.scrollToX(this.running_layout.scrollX);
				this.running_layout.scrollToY(this.running_layout.scrollY);
			}
		}
		else
			this.aspect_scale = 1;
		this.ClearDeathRow();
		this.isInOnDestroy++;
		this.system.runWaits();		// prevent instance list changing
		this.isInOnDestroy--;
		this.ClearDeathRow();		// allow instance list changing
		this.isInOnDestroy++;
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					inst.behavior_insts[k].tick();
				}
			}
		}
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					binst = inst.behavior_insts[k];
					if (binst.posttick)
						binst.posttick();
				}
			}
		}
        var tickarr = this.objects_to_tick.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
		this.handleSaveLoad();		// save/load now if queued
		i = 0;
		while (this.changelayout && i++ < 10)
		{
			this.doChangeLayout(this.changelayout);
		}
        for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
            this.eventsheets_by_index[i].hasRun = false;
		if (this.running_layout.event_sheet)
			this.running_layout.event_sheet.run();
		this.registered_collisions.length = 0;
		this.layout_first_tick = false;
		this.isInOnDestroy++;		// prevent instance lists from being changed
		for (i = 0, leni = this.types_by_index.length; i < leni; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				var inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
				{
					binst = inst.behavior_insts[k];
					if (binst.tick2)
						binst.tick2();
				}
			}
		}
        tickarr = this.objects_to_tick2.valuesRef();
        for (i = 0, leni = tickarr.length; i < leni; i++)
            tickarr[i].tick2();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
	};
	Runtime.prototype.doChangeLayout = function (changeToLayout)
	{
;
		var prev_layout = this.running_layout;
		this.running_layout.stopRunning();
		var i, len, j, lenj, k, lenk, type, inst, binst;
		if (this.glwrap)
		{
			for (i = 0, len = this.types_by_index.length; i < len; i++)
			{
				type = this.types_by_index[i];
				if (type.is_family)
					continue;
				if (type.unloadTextures && (!type.global || type.instances.length === 0) && changeToLayout.initial_types.indexOf(type) === -1)
				{
					type.unloadTextures();
				}
			}
		}
		if (prev_layout == changeToLayout)
			this.system.waits.length = 0;
		changeToLayout.startRunning();
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (!type.global && !type.plugin.singleglobal)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				if (inst.onLayoutChange)
					inst.onLayoutChange();
				if (inst.behavior_insts)
				{
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
					{
						binst = inst.behavior_insts[k];
						if (binst.onLayoutChange)
							binst.onLayoutChange();
					}
				}
			}
		}
		this.redraw = true;
		this.layout_first_tick = true;
		this.ClearDeathRow();
	};
    Runtime.prototype.tickMe = function (inst)
    {
        this.objects_to_tick.add(inst);
    };
	Runtime.prototype.untickMe = function (inst)
	{
		this.objects_to_tick.remove(inst);
	};
	Runtime.prototype.tick2Me = function (inst)
    {
        this.objects_to_tick2.add(inst);
    };
	Runtime.prototype.untick2Me = function (inst)
	{
		this.objects_to_tick2.remove(inst);
	};
    Runtime.prototype.getDt = function (inst)
    {
        if (!inst || inst.my_timescale === -1.0)
            return this.dt;
        return this.dt1 * inst.my_timescale;
    };
	Runtime.prototype.draw = function ()
	{
		this.running_layout.draw(this.ctx);
		if (this.isDirectCanvas)
			this.ctx["present"]();
	};
	Runtime.prototype.drawGL = function ()
	{
		this.running_layout.drawGL(this.glwrap);
		this.glwrap.present();
	};
	Runtime.prototype.addDestroyCallback = function (f)
	{
		if (f)
			this.destroycallbacks.push(f);
	};
	Runtime.prototype.removeDestroyCallback = function (f)
	{
		cr.arrayFindRemove(this.destroycallbacks, f);
	};
	Runtime.prototype.getObjectByUID = function (uid_)
	{
;
		return this.objectsByUid[uid_.toString()];
	};
	Runtime.prototype.DestroyInstance = function (inst)
	{
		var i, len;
		if (!this.deathRow.contains(inst))
		{
			this.deathRow.add(inst);
			if (inst.is_contained)
			{
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					this.DestroyInstance(inst.siblings[i]);
				}
			}
			if (this.isInClearDeathRow)
				this.deathRow.values_cache.push(inst);
			this.isInOnDestroy++;		// support recursion
			this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
			this.isInOnDestroy--;
		}
	};
	Runtime.prototype.ClearDeathRow = function ()
	{
		var inst, index, type, instances, binst;
		var i, j, k, leni, lenj, lenk;
		var w, f;
		this.isInClearDeathRow = true;
		for (i = 0, leni = this.createRow.length; i < leni; i++)
		{
			inst = this.createRow[i];
			type = inst.type;
			type.instances.push(inst);
			for (j = 0, lenj = type.families.length; j < lenj; j++)
			{
				type.families[j].instances.push(inst);
				type.families[j].stale_iids = true;
			}
		}
		this.createRow.length = 0;
		var arr = this.deathRow.valuesRef();	// get array of items from set
		for (i = 0; i < arr.length; i++)		// check array length every time in case it changes
		{
			inst = arr[i];
			type = inst.type;
			instances = type.instances;
			for (j = 0, lenj = this.destroycallbacks.length; j < lenj; j++)
				this.destroycallbacks[j](inst);
			cr.arrayFindRemove(instances, inst);
			if (inst.layer)
			{
				cr.arrayRemove(inst.layer.instances, inst.get_zindex());
				inst.layer.zindices_stale = true;
			}
			for (j = 0, lenj = type.families.length; j < lenj; j++)
			{
				cr.arrayFindRemove(type.families[j].instances, inst);
				type.families[j].stale_iids = true;
			}
			if (inst.behavior_insts)
			{
				for (j = 0, lenj = inst.behavior_insts.length; j < lenj; j++)
				{
					binst = inst.behavior_insts[j];
					if (binst.onDestroy)
						binst.onDestroy();
					binst.behavior.my_instances.remove(inst);
				}
			}
            this.objects_to_tick.remove(inst);
			this.objects_to_tick2.remove(inst);
			for (j = 0, lenj = this.system.waits.length; j < lenj; j++)
			{
				w = this.system.waits[j];
				if (w.sols.hasOwnProperty(type.index))
					cr.arrayFindRemove(w.sols[type.index].insts, inst);
				if (!type.is_family)
				{
					for (k = 0, lenk = type.families.length; k < lenk; k++)
					{
						f = type.families[k];
						if (w.sols.hasOwnProperty(f.index))
							cr.arrayFindRemove(w.sols[f.index].insts, inst);
					}
				}
			}
			if (inst.onDestroy)
				inst.onDestroy();
			if (this.objectsByUid.hasOwnProperty(inst.uid.toString()))
				delete this.objectsByUid[inst.uid.toString()];
			this.objectcount--;
			if (type.deadCache.length < 64)
				type.deadCache.push(inst);
			type.stale_iids = true;
		}
		if (!this.deathRow.isEmpty())
			this.redraw = true;
		this.deathRow.clear();
		this.isInClearDeathRow = false;
	};
	Runtime.prototype.createInstance = function (type, layer, sx, sy)
	{
		if (type.is_family)
		{
			var i = cr.floor(Math.random() * type.members.length);
			return this.createInstance(type.members[i], layer, sx, sy);
		}
		if (!type.default_instance)
		{
			return null;
		}
		return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy, false);
	};
	var all_behaviors = [];
	Runtime.prototype.createInstanceFromInit = function (initial_inst, layer, is_startup_instance, sx, sy, skip_siblings)
	{
		var i, len, j, lenj, p, effect_fallback, x, y;
		if (!initial_inst)
			return null;
		var type = this.types_by_index[initial_inst[1]];
;
;
		var is_world = type.plugin.is_world;
;
		if (this.isloading && is_world && !type.isOnLoaderLayout)
			return null;
		if (is_world && !this.glwrap && initial_inst[0][11] === 11)
			return null;
		var original_layer = layer;
		if (!is_world)
			layer = null;
		var inst;
		if (type.deadCache.length)
		{
			inst = type.deadCache.pop();
			inst.recycled = true;
			type.plugin.Instance.call(inst, type);
		}
		else
		{
			inst = new type.plugin.Instance(type);
			inst.recycled = false;
		}
		if (is_startup_instance && !skip_siblings)
			inst.uid = initial_inst[2];
		else
			inst.uid = this.next_uid++;
		this.objectsByUid[inst.uid.toString()] = inst;
		inst.puid = this.next_puid++;
		inst.iid = type.instances.length;
		for (i = 0, len = this.createRow.length; i < len; ++i)
		{
			if (this.createRow[i].type === type)
				inst.iid++;
		}
		inst.get_iid = cr.inst_get_iid;
		var initial_vars = initial_inst[3];
		if (inst.recycled)
		{
			cr.wipe(inst.extra);
		}
		else
		{
			inst.extra = {};
			if (typeof cr_is_preview !== "undefined")
			{
				inst.instance_var_names = [];
				inst.instance_var_names.length = initial_vars.length;
				for (i = 0, len = initial_vars.length; i < len; i++)
					inst.instance_var_names[i] = initial_vars[i][1];
			}
			inst.instance_vars = [];
			inst.instance_vars.length = initial_vars.length;
		}
		for (i = 0, len = initial_vars.length; i < len; i++)
			inst.instance_vars[i] = initial_vars[i][0];
		if (is_world)
		{
			var wm = initial_inst[0];
;
			inst.x = cr.is_undefined(sx) ? wm[0] : sx;
			inst.y = cr.is_undefined(sy) ? wm[1] : sy;
			inst.z = wm[2];
			inst.width = wm[3];
			inst.height = wm[4];
			inst.depth = wm[5];
			inst.angle = wm[6];
			inst.opacity = wm[7];
			inst.hotspotX = wm[8];
			inst.hotspotY = wm[9];
			inst.blend_mode = wm[10];
			effect_fallback = wm[11];
			if (!this.glwrap && type.effect_types.length)	// no WebGL renderer and shaders used
				inst.blend_mode = effect_fallback;			// use fallback blend mode - destroy mode was handled above
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			if (inst.recycled)
			{
				for (i = 0, len = wm[12].length; i < len; i++)
				{
					for (j = 0, lenj = wm[12][i].length; j < lenj; j++)
						inst.effect_params[i][j] = wm[12][i][j];
				}
				inst.bbox.set(0, 0, 0, 0);
				inst.bquad.set_from_rect(inst.bbox);
				inst.bbox_changed_callbacks.length = 0;
			}
			else
			{
				inst.effect_params = wm[12].slice(0);
				for (i = 0, len = inst.effect_params.length; i < len; i++)
					inst.effect_params[i] = wm[12][i].slice(0);
				inst.active_effect_types = [];
				inst.active_effect_flags = [];
				inst.active_effect_flags.length = type.effect_types.length;
				inst.bbox = new cr.rect(0, 0, 0, 0);
				inst.bquad = new cr.quad();
				inst.bbox_changed_callbacks = [];
				inst.set_bbox_changed = cr.set_bbox_changed;
				inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
				inst.contains_pt = cr.inst_contains_pt;
				inst.update_bbox = cr.update_bbox;
				inst.get_zindex = cr.inst_get_zindex;
			}
			for (i = 0, len = type.effect_types.length; i < len; i++)
				inst.active_effect_flags[i] = true;
			inst.updateActiveEffects = cr.inst_updateActiveEffects;
			inst.updateActiveEffects();
			inst.uses_shaders = !!inst.active_effect_types.length;
			inst.bbox_changed = true;
			inst.visible = true;
            inst.my_timescale = -1.0;
			inst.layer = layer;
			inst.zindex = layer.instances.length;	// will be placed at top of current layer
			if (typeof inst.collision_poly === "undefined")
				inst.collision_poly = null;
			inst.collisionsEnabled = true;
			this.redraw = true;
		}
		inst.toString = cr.inst_toString;
		var initial_props, binst;
		all_behaviors.length = 0;
		for (i = 0, len = type.families.length; i < len; i++)
		{
			all_behaviors.push.apply(all_behaviors, type.families[i].behaviors);
		}
		all_behaviors.push.apply(all_behaviors, type.behaviors);
		if (inst.recycled)
		{
			for (i = 0, len = all_behaviors.length; i < len; i++)
			{
				var btype = all_behaviors[i];
				binst = inst.behavior_insts[i];
				binst.recycled = true;
				btype.behavior.Instance.call(binst, btype, inst);
				initial_props = initial_inst[4][i];
				for (j = 0, lenj = initial_props.length; j < lenj; j++)
					binst.properties[j] = initial_props[j];
				binst.onCreate();
				btype.behavior.my_instances.add(inst);
			}
		}
		else
		{
			inst.behavior_insts = [];
			for (i = 0, len = all_behaviors.length; i < len; i++)
			{
				var btype = all_behaviors[i];
				var binst = new btype.behavior.Instance(btype, inst);
				binst.recycled = false;
				binst.properties = initial_inst[4][i].slice(0);
				binst.onCreate();
				cr.seal(binst);
				inst.behavior_insts.push(binst);
				btype.behavior.my_instances.add(inst);
			}
		}
		initial_props = initial_inst[5];
		if (inst.recycled)
		{
			for (i = 0, len = initial_props.length; i < len; i++)
				inst.properties[i] = initial_props[i];
		}
		else
			inst.properties = initial_props.slice(0);
		this.createRow.push(inst);
		if (layer)
		{
;
			layer.instances.push(inst);
		}
		this.objectcount++;
		if (type.is_contained)
		{
			inst.is_contained = true;
			if (inst.recycled)
				inst.siblings.length = 0;
			else
				inst.siblings = [];			// note: should not include self in siblings
			if (!is_startup_instance && !skip_siblings)	// layout links initial instances
			{
				for (i = 0, len = type.container.length; i < len; i++)
				{
					if (type.container[i] === type)
						continue;
					if (!type.container[i].default_instance)
					{
						return null;
					}
					inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance, original_layer, false, is_world ? inst.x : sx, is_world ? inst.y : sy, true));
				}
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					inst.siblings[i].siblings.push(inst);
					for (j = 0; j < len; j++)
					{
						if (i !== j)
							inst.siblings[i].siblings.push(inst.siblings[j]);
					}
				}
			}
		}
		else
		{
			inst.is_contained = false;
			inst.siblings = null;
		}
		inst.onCreate();
		if (!inst.recycled)
			cr.seal(inst);
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i].postCreate)
				inst.behavior_insts[i].postCreate();
		}
		return inst;
	};
	Runtime.prototype.getLayerByName = function (layer_name)
	{
		var i, len;
		for (i = 0, len = this.running_layout.layers.length; i < len; i++)
		{
			var layer = this.running_layout.layers[i];
			if (cr.equals_nocase(layer.name, layer_name))
				return layer;
		}
		return null;
	};
	Runtime.prototype.getLayerByNumber = function (index)
	{
		index = cr.floor(index);
		if (index < 0)
			index = 0;
		if (index >= this.running_layout.layers.length)
			index = this.running_layout.layers.length - 1;
		return this.running_layout.layers[index];
	};
	Runtime.prototype.getLayer = function (l)
	{
		if (cr.is_number(l))
			return this.getLayerByNumber(l);
		else
			return this.getLayerByName(l.toString());
	};
	Runtime.prototype.clearSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].getCurrentSol().select_all = true;
		}
	};
	Runtime.prototype.pushCleanSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].pushCleanSol();
		}
	};
	Runtime.prototype.pushCopySol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].pushCopySol();
		}
	};
	Runtime.prototype.popSol = function (solModifiers)
	{
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++)
		{
			solModifiers[i].popSol();
		}
	};
	Runtime.prototype.testAndSelectCanvasPointOverlap = function (type, ptx, pty, inverted)
	{
		var sol = type.getCurrentSol();
		var i, j, inst, len;
		var lx, ly;
		if (sol.select_all)
		{
			if (!inverted)
			{
				sol.select_all = false;
				sol.instances.length = 0;   // clear contents
			}
			for (i = 0, len = type.instances.length; i < len; i++)
			{
				inst = type.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly))
				{
					if (inverted)
						return false;
					else
						sol.instances.push(inst);
				}
			}
		}
		else
		{
			j = 0;
			for (i = 0, len = sol.instances.length; i < len; i++)
			{
				inst = sol.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly))
				{
					if (inverted)
						return false;
					else
					{
						sol.instances[j] = sol.instances[i];
						j++;
					}
				}
			}
			if (!inverted)
				sol.instances.length = j;
		}
		type.applySolToContainer();
		if (inverted)
			return true;		// did not find anything overlapping
		else
			return sol.hasObjects();
	};
	Runtime.prototype.testOverlap = function (a, b)
	{
		if (!a || !b || a === b || !a.collisionsEnabled || !b.collisionsEnabled)
			return false;
		a.update_bbox();
		b.update_bbox();
		var layera = a.layer;
		var layerb = b.layer;
		var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
		var i, len, x, y, haspolya, haspolyb, polya, polyb;
		if (!different_layers)	// same layers: easy check
		{
			if (!a.bbox.intersects_rect(b.bbox))
				return false;
			if (!a.bquad.intersects_quad(b.bquad))
				return false;
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolya && !haspolyb)
				return true;
			if (haspolya)
			{
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				polya = a.collision_poly;
			}
			else
			{
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
				polya = this.temp_poly;
			}
			if (haspolyb)
			{
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				polyb = b.collision_poly;
			}
			else
			{
				this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
				polyb = this.temp_poly;
			}
			return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y);
		}
		else	// different layers: need to do full translated check
		{
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (haspolya)
			{
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				this.temp_poly.set_from_poly(a.collision_poly);
			}
			else
			{
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
			}
			polya = this.temp_poly;
			if (haspolyb)
			{
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				this.temp_poly2.set_from_poly(b.collision_poly);
			}
			else
			{
				this.temp_poly2.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
			}
			polyb = this.temp_poly2;
			for (i = 0, len = polya.pts_count; i < len; i++)
			{
				x = polya.pts_cache[i*2];
				y = polya.pts_cache[i*2+1];
				polya.pts_cache[i*2] = layera.layerToCanvas(x + a.x, y + a.y, true);
				polya.pts_cache[i*2+1] = layera.layerToCanvas(x + a.x, y + a.y, false);
			}
			for (i = 0, len = polyb.pts_count; i < len; i++)
			{
				x = polyb.pts_cache[i*2];
				y = polyb.pts_cache[i*2+1];
				polyb.pts_cache[i*2] = layerb.layerToCanvas(x + b.x, y + b.y, true);
				polyb.pts_cache[i*2+1] = layerb.layerToCanvas(x + b.x, y + b.y, false);
			}
			return polya.intersects_poly(polyb, 0, 0);
		}
	};
	var tmpQuad = new cr.quad();
	var tmpRect = new cr.rect(0, 0, 0, 0);
	Runtime.prototype.testRectOverlap = function (r, b)
	{
		if (!b || !b.collisionsEnabled)
			return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		if (!b.bbox.intersects_rect(r))
			return false;
		tmpQuad.set_from_rect(r);
		if (!b.bquad.intersects_quad(tmpQuad))
			return false;
		haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
		if (!haspolyb)
			return true;
		b.collision_poly.cache_poly(b.width, b.height, b.angle);
		tmpQuad.offset(-r.left, -r.top);
		this.temp_poly.set_from_quad(tmpQuad, 0, 0, 1, 1);
		return b.collision_poly.intersects_poly(this.temp_poly, r.left - b.x, r.top - b.y);
	};
	Runtime.prototype.testSegmentOverlap = function (x1, y1, x2, y2, b)
	{
		if (!b || !b.collisionsEnabled)
			return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		tmpRect.set(cr.min(x1, x2), cr.min(y1, y2), cr.max(x1, x2), cr.max(y1, y2));
		if (!b.bbox.intersects_rect(tmpRect))
			return false;
		if (!b.bquad.intersects_segment(x1, y1, x2, y2))
			return false;
		haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
		if (!haspolyb)
			return true;
		b.collision_poly.cache_poly(b.width, b.height, b.angle);
		return b.collision_poly.intersects_segment(b.x, b.y, x1, y1, x2, y2);
	};
	Runtime.prototype.typeHasBehavior = function (t, b)
	{
		if (!b)
			return false;
		var i, len, j, lenj, f;
		for (i = 0, len = t.behaviors.length; i < len; i++)
		{
			if (t.behaviors[i].behavior instanceof b)
				return true;
		}
		if (!t.is_family)
		{
			for (i = 0, len = t.families.length; i < len; i++)
			{
				f = t.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
				{
					if (f.behaviors[j].behavior instanceof b)
						return true;
				}
			}
		}
		return false;
	};
	Runtime.prototype.typeHasNoSaveBehavior = function (t)
	{
		return this.typeHasBehavior(t, cr.behaviors.NoSave);
	};
	Runtime.prototype.typeHasPersistBehavior = function (t)
	{
		return this.typeHasBehavior(t, cr.behaviors.Persist);
	};
	Runtime.prototype.getSolidBehavior = function ()
	{
		if (!cr.behaviors.solid)
			return null;
		var i, len;
		for (i = 0, len = this.behaviors.length; i < len; i++)
		{
			if (this.behaviors[i] instanceof cr.behaviors.solid)
				return this.behaviors[i];
		}
		return null;
	};
	Runtime.prototype.testOverlapSolid = function (inst)
	{
		var solid = this.getSolidBehavior();
		if (!solid)
			return null;
		var i, len, s;
		var solids = solid.my_instances.valuesRef();
		for (i = 0, len = solids.length; i < len; ++i)
		{
			s = solids[i];
			if (!s.extra.solidEnabled)
				continue;
			if (this.testOverlap(inst, s))
				return s;
		}
		return null;
	};
	Runtime.prototype.testRectOverlapSolid = function (r)
	{
		var solid = this.getSolidBehavior();
		if (!solid)
			return null;
		var i, len, s;
		var solids = solid.my_instances.valuesRef();
		for (i = 0, len = solids.length; i < len; ++i)
		{
			s = solids[i];
			if (!s.extra.solidEnabled)
				continue;
			if (this.testRectOverlap(r, s))
				return s;
		}
		return null;
	};
	var jumpthru_array_ret = [];
	Runtime.prototype.testOverlapJumpThru = function (inst, all)
	{
		var jumpthru = null;
		var i, len, s;
		if (!cr.behaviors.jumpthru)
			return null;
		for (i = 0, len = this.behaviors.length; i < len; i++)
		{
			if (this.behaviors[i] instanceof cr.behaviors.jumpthru)
			{
				jumpthru = this.behaviors[i];
				break;
			}
		}
		if (!jumpthru)
			return null;
		var ret = null;
		if (all)
		{
			ret = jumpthru_array_ret;
			ret.length = 0;
		}
		var jumpthrus = jumpthru.my_instances.valuesRef();
		for (i = 0, len = jumpthrus.length; i < len; ++i)
		{
			s = jumpthrus[i];
			if (!s.extra.jumpthruEnabled)
				continue;
			if (this.testOverlap(inst, s))
			{
				if (all)
					ret.push(s);
				else
					return s;
			}
		}
		return ret;
	};
	Runtime.prototype.pushOutSolid = function (inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru)
	{
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		var last_overlapped = null, secondlast_overlapped = null;
		for (i = 0; i < push_dist; i++)
		{
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped))
			{
				last_overlapped = this.testOverlapSolid(inst);
				if (last_overlapped)
					secondlast_overlapped = last_overlapped;
				if (!last_overlapped)
				{
					if (include_jumpthrus)
					{
						if (specific_jumpthru)
							last_overlapped = (this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null);
						else
							last_overlapped = this.testOverlapJumpThru(inst);
						if (last_overlapped)
							secondlast_overlapped = last_overlapped;
					}
					if (!last_overlapped)
					{
						if (secondlast_overlapped)
							this.pushInFractional(inst, xdir, ydir, secondlast_overlapped, 16);
						return true;
					}
				}
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushOut = function (inst, xdir, ydir, dist, otherinst)
	{
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		for (i = 0; i < push_dist; i++)
		{
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, otherinst))
				return true;
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushInFractional = function (inst, xdir, ydir, obj, limit)
	{
		var divisor = 2;
		var frac;
		var forward = false;
		var overlapping = false;
		var bestx = inst.x;
		var besty = inst.y;
		while (divisor <= limit)
		{
			frac = 1 / divisor;
			divisor *= 2;
			inst.x += xdir * frac * (forward ? 1 : -1);
			inst.y += ydir * frac * (forward ? 1 : -1);
			inst.set_bbox_changed();
			if (this.testOverlap(inst, obj))
			{
				forward = true;
				overlapping = true;
			}
			else
			{
				forward = false;
				overlapping = false;
				bestx = inst.x;
				besty = inst.y;
			}
		}
		if (overlapping)
		{
			inst.x = bestx;
			inst.y = besty;
			inst.set_bbox_changed();
		}
	};
	Runtime.prototype.pushOutSolidNearest = function (inst, max_dist_)
	{
		var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
		var dist = 0;
		var oldx = inst.x
		var oldy = inst.y;
		var dir = 0;
		var dx = 0, dy = 0;
		var last_overlapped = this.testOverlapSolid(inst);
		if (!last_overlapped)
			return true;		// already clear of solids
		while (dist <= max_dist)
		{
			switch (dir) {
			case 0:		dx = 0; dy = -1; dist++; break;
			case 1:		dx = 1; dy = -1; break;
			case 2:		dx = 1; dy = 0; break;
			case 3:		dx = 1; dy = 1; break;
			case 4:		dx = 0; dy = 1; break;
			case 5:		dx = -1; dy = 1; break;
			case 6:		dx = -1; dy = 0; break;
			case 7:		dx = -1; dy = -1; break;
			}
			dir = (dir + 1) % 8;
			inst.x = cr.floor(oldx + (dx * dist));
			inst.y = cr.floor(oldy + (dy * dist));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped))
			{
				last_overlapped = this.testOverlapSolid(inst);
				if (!last_overlapped)
					return true;
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.registerCollision = function (a, b)
	{
		if (!a.collisionsEnabled || !b.collisionsEnabled)
			return;
		this.registered_collisions.push([a, b]);
	};
	Runtime.prototype.checkRegisteredCollision = function (a, b)
	{
		var i, len, x;
		for (i = 0, len = this.registered_collisions.length; i < len; i++)
		{
			x = this.registered_collisions[i];
			if ((x[0] == a && x[1] == b) || (x[0] == b && x[1] == a))
				return true;
		}
		return false;
	};
	Runtime.prototype.calculateSolidBounceAngle = function(inst, startx, starty, obj)
	{
		var objx = inst.x;
		var objy = inst.y;
		var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
		var startangle = cr.angleTo(startx, starty, objx, objy);
		var firstsolid = obj || this.testOverlapSolid(inst);
		if (!firstsolid)
			return cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
		var increment = cr.to_radians(5);	// 5 degree increments
		for (i = 1; i < 36; i++)
		{
			curangle = startangle - i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid))
			{
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid)
				{
					anticlockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		for (i = 1; i < 36; i++)
		{
			curangle = startangle + i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid))
			{
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid)
				{
					clockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		inst.x = objx;
		inst.y = objy;
		inst.set_bbox_changed();
		if (clockwise_free_angle === anticlockwise_free_angle)
			return clockwise_free_angle;
		var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
		var normal;
		if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle))
		{
			normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
		}
		else
		{
			normal = cr.clamp_angle(clockwise_free_angle + half_diff);
		}
;
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normal);
		var ny = Math.sin(normal);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
		return cr.angleTo(0, 0, rx, ry);
	};
	var triggerSheetStack = [];
	var triggerSheetIndex = -1;
	Runtime.prototype.trigger = function (method, inst, value /* for fast triggers */)
	{
;
		if (!this.running_layout)
			return false;
		var sheet = this.running_layout.event_sheet;
		if (!sheet)
			return false;     // no event sheet active; nothing to trigger
		triggerSheetIndex++;
		if (triggerSheetIndex === triggerSheetStack.length)
			triggerSheetStack.push(new cr.ObjectSet());
		else
			triggerSheetStack[triggerSheetIndex].clear();
        var ret = this.triggerOnSheet(method, inst, sheet, value);
		triggerSheetIndex--;
		return ret;
    };
    Runtime.prototype.triggerOnSheet = function (method, inst, sheet, value)
    {
		var alreadyTriggeredSheets = triggerSheetStack[triggerSheetIndex];
        if (alreadyTriggeredSheets.contains(sheet))
            return false;
        alreadyTriggeredSheets.add(sheet);
        var includes = sheet.includes.valuesRef();
        var ret = false;
		var i, leni, r;
        for (i = 0, leni = includes.length; i < leni; i++)
        {
			if (includes[i].isActive())
			{
				r = this.triggerOnSheet(method, inst, includes[i].include_sheet, value);
				ret = ret || r;
			}
        }
		if (!inst)
		{
			r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
			ret = ret || r;
		}
		else
		{
			r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
			ret = ret || r;
			for (i = 0, leni = inst.type.families.length; i < leni; i++)
			{
				r = this.triggerOnSheetForTypeName(method, inst, inst.type.families[i].name, sheet, value);
				ret = ret || r;
			}
		}
		return ret;             // true if anything got triggered
	};
	Runtime.prototype.triggerOnSheetForTypeName = function (method, inst, type_name, sheet, value)
	{
		var i, leni;
		var ret = false, ret2 = false;
		var trig, index;
		var fasttrigger = (typeof value !== "undefined");
		var triggers = (fasttrigger ? sheet.fasttriggers : sheet.triggers);
		var obj_entry = triggers[type_name];
		if (!obj_entry)
			return ret;
		var triggers_list = null;
		for (i = 0, leni = obj_entry.length; i < leni; i++)
		{
			if (obj_entry[i].method == method)
			{
				triggers_list = obj_entry[i].evs;
				break;
			}
		}
		if (!triggers_list)
			return ret;
		var triggers_to_fire;
		if (fasttrigger)
		{
			triggers_to_fire = triggers_list[value];
		}
		else
		{
			triggers_to_fire = triggers_list;
		}
		if (!triggers_to_fire)
			return null;
		for (i = 0, leni = triggers_to_fire.length; i < leni; i++)
		{
			trig = triggers_to_fire[i][0];
			index = triggers_to_fire[i][1];
			ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
			ret = ret || ret2;
		}
		return ret;
	};
	Runtime.prototype.executeSingleTrigger = function (inst, type_name, trig, index)
	{
		var i, leni;
		var ret = false;
		this.trigger_depth++;
		var current_event = this.getCurrentEventStack().current_event;
		if (current_event)
			this.pushCleanSol(current_event.solModifiersIncludingParents);
		var isrecursive = (this.trigger_depth > 1);		// calling trigger from inside another trigger
		this.pushCleanSol(trig.solModifiersIncludingParents);
		if (isrecursive)
			this.pushLocalVarStack();
		var event_stack = this.pushEventStack(trig);
		event_stack.current_event = trig;
		if (inst)
		{
			var sol = this.types[type_name].getCurrentSol();
			sol.select_all = false;
			sol.instances.length = 1;
			sol.instances[0] = inst;
			this.types[type_name].applySolToContainer();
		}
		var ok_to_run = true;
		if (trig.parent)
		{
			var temp_parents_arr = event_stack.temp_parents_arr;
			var cur_parent = trig.parent;
			while (cur_parent)
			{
				temp_parents_arr.push(cur_parent);
				cur_parent = cur_parent.parent;
			}
			temp_parents_arr.reverse();
			for (i = 0, leni = temp_parents_arr.length; i < leni; i++)
			{
				if (!temp_parents_arr[i].run_pretrigger())   // parent event failed
				{
					ok_to_run = false;
					break;
				}
			}
		}
		if (ok_to_run)
		{
			this.execcount++;
			if (trig.orblock)
				trig.run_orblocktrigger(index);
			else
				trig.run();
			ret = ret || event_stack.last_event_true;
		}
		this.popEventStack();
		if (isrecursive)
			this.popLocalVarStack();
		this.popSol(trig.solModifiersIncludingParents);
		if (current_event)
			this.popSol(current_event.solModifiersIncludingParents);
		if (this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents && (!this.deathRow.isEmpty() || this.createRow.length))
		{
			this.ClearDeathRow();
		}
		this.trigger_depth--;
		return ret;
	};
	Runtime.prototype.getCurrentCondition = function ()
	{
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.conditions[evinfo.cndindex];
	};
	Runtime.prototype.getCurrentAction = function ()
	{
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.actions[evinfo.actindex];
	};
	Runtime.prototype.pushLocalVarStack = function ()
	{
		this.localvar_stack_index++;
		if (this.localvar_stack_index >= this.localvar_stack.length)
			this.localvar_stack.push([]);
	};
	Runtime.prototype.popLocalVarStack = function ()
	{
;
		this.localvar_stack_index--;
	};
	Runtime.prototype.getCurrentLocalVarStack = function ()
	{
		return this.localvar_stack[this.localvar_stack_index];
	};
	Runtime.prototype.pushEventStack = function (cur_event)
	{
		this.event_stack_index++;
		if (this.event_stack_index >= this.event_stack.length)
			this.event_stack.push(new cr.eventStackFrame());
		var ret = this.getCurrentEventStack();
		ret.reset(cur_event);
		return ret;
	};
	Runtime.prototype.popEventStack = function ()
	{
;
		this.event_stack_index--;
	};
	Runtime.prototype.getCurrentEventStack = function ()
	{
		return this.event_stack[this.event_stack_index];
	};
	Runtime.prototype.pushLoopStack = function (name_)
	{
		this.loop_stack_index++;
		if (this.loop_stack_index >= this.loop_stack.length)
		{
			this.loop_stack.push(cr.seal({ name: name_, index: 0, stopped: false }));
		}
		var ret = this.getCurrentLoop();
		ret.name = name_;
		ret.index = 0;
		ret.stopped = false;
		return ret;
	};
	Runtime.prototype.popLoopStack = function ()
	{
;
		this.loop_stack_index--;
	};
	Runtime.prototype.getCurrentLoop = function ()
	{
		return this.loop_stack[this.loop_stack_index];
	};
	Runtime.prototype.getEventVariableByName = function (name, scope)
	{
		var i, leni, j, lenj, sheet, e;
		while (scope)
		{
			for (i = 0, leni = scope.subevents.length; i < leni; i++)
			{
				e = scope.subevents[i];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name))
					return e;
			}
			scope = scope.parent;
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
		{
			sheet = this.eventsheets_by_index[i];
			for (j = 0, lenj = sheet.events.length; j < lenj; j++)
			{
				e = sheet.events[j];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name))
					return e;
			}
		}
		return null;
	};
	Runtime.prototype.getLayoutBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			if (this.layouts_by_index[i].sid === sid_)
				return this.layouts_by_index[i];
		}
		return null;
	};
	Runtime.prototype.getObjectTypeBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			if (this.types_by_index[i].sid === sid_)
				return this.types_by_index[i];
		}
		return null;
	};
	Runtime.prototype.getGroupBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.allGroups.length; i < len; i++)
		{
			if (this.allGroups[i].sid === sid_)
				return this.allGroups[i];
		}
		return null;
	};
	function makeSaveDb(e)
	{
		var db = e.target.result;
		db.createObjectStore("saves", { keyPath: "slot" });
	};
	function IndexedDB_WriteSlot(slot_, data_, oncomplete_, onerror_)
	{
		var request = indexedDB.open("_C2SaveStates");
		request.onupgradeneeded = makeSaveDb;
		request.onerror = onerror_;
		request.onsuccess = function (e)
		{
			var db = e.target.result;
			db.onerror = onerror_;
			var transaction = db.transaction(["saves"], "readwrite");
			var objectStore = transaction.objectStore("saves");
			var putReq = objectStore.put({"slot": slot_, "data": data_ });
			putReq.onsuccess = oncomplete_;
		};
	};
	function IndexedDB_ReadSlot(slot_, oncomplete_, onerror_)
	{
		var request = indexedDB.open("_C2SaveStates");
		request.onupgradeneeded = makeSaveDb;
		request.onerror = onerror_;
		request.onsuccess = function (e)
		{
			var db = e.target.result;
			db.onerror = onerror_;
			var transaction = db.transaction(["saves"]);
			var objectStore = transaction.objectStore("saves");
			var readReq = objectStore.get(slot_);
			readReq.onsuccess = function (e)
			{
				if (readReq.result)
					oncomplete_(readReq.result["data"]);
				else
					oncomplete_(null);
			};
		};
	};
	Runtime.prototype.signalContinuousPreview = function ()
	{
		this.signalledContinuousPreview = true;
	};
	function doContinuousPreviewReload()
	{
		cr.logexport("Reloading for continuous preview");
		if (!!window["c2cocoonjs"])
		{
			CocoonJS["App"]["reload"]();
		}
		else
		{
			if (window.location.search.indexOf("continuous") > -1)
				window.location.reload(true);
			else
				window.location = window.location + "?continuous";
		}
	};
	Runtime.prototype.handleSaveLoad = function ()
	{
		var self = this;
		var savingToSlot = this.saveToSlot;
		var savingJson = this.lastSaveJson;
		var loadingFromSlot = this.loadFromSlot;
		var continuous = false;
		if (this.signalledContinuousPreview)
		{
			continuous = true;
			savingToSlot = "__c2_continuouspreview";
			this.signalledContinuousPreview = false;
		}
		if (savingToSlot.length)
		{
			this.ClearDeathRow();
			savingJson = this.saveToJSONString();
			if (window.indexedDB && !this.isCocoonJs)
			{
				IndexedDB_WriteSlot(savingToSlot, savingJson, function ()
				{
					cr.logexport("Saved state to IndexedDB storage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous)
						doContinuousPreviewReload();
				}, function (e)
				{
					try {
						localStorage.setItem("__c2save_" + savingToSlot, savingJson);
						cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
						self.lastSaveJson = savingJson;
						self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
						self.lastSaveJson = "";
						if (continuous)
							doContinuousPreviewReload();
					}
					catch (f)
					{
						cr.logexport("Failed to save game state: " + e + "; " + f);
					}
				});
			}
			else
			{
				try {
					localStorage.setItem("__c2save_" + savingToSlot, savingJson);
					cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					this.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous)
						doContinuousPreviewReload();
				}
				catch (e)
				{
					cr.logexport("Error saving to WebStorage: " + e);
				}
			}
			this.saveToSlot = "";
			this.loadFromSlot = "";
			this.loadFromJson = "";
		}
		if (loadingFromSlot.length)
		{
			if (window.indexedDB && !this.isCocoonJs)
			{
				IndexedDB_ReadSlot(loadingFromSlot, function (result_)
				{
					if (result_)
					{
						self.loadFromJson = result_;
						cr.logexport("Loaded state from IndexedDB storage (" + self.loadFromJson.length + " bytes)");
					}
					else
					{
						self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
						cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					}
					self.suspendDrawing = false;
					if (!self.loadFromJson.length)
						self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
				}, function (e)
				{
					self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
					cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					self.suspendDrawing = false;
					if (!self.loadFromJson.length)
						self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
				});
			}
			else
			{
				this.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
				cr.logexport("Loaded state from WebStorage (" + this.loadFromJson.length + " bytes)");
				this.suspendDrawing = false;
				if (!self.loadFromJson.length)
					self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
			}
			this.loadFromSlot = "";
			this.saveToSlot = "";
		}
		if (this.loadFromJson.length)
		{
			this.ClearDeathRow();
			this.loadFromJSONString(this.loadFromJson);
			this.lastSaveJson = this.loadFromJson;
			this.trigger(cr.system_object.prototype.cnds.OnLoadComplete, null);
			this.lastSaveJson = "";
			this.loadFromJson = "";
		}
	};
	function CopyExtraObject(extra)
	{
		var p, ret = {};
		for (p in extra)
		{
			if (extra.hasOwnProperty(p))
			{
				if (extra[p] instanceof cr.ObjectSet)
					continue;
				if (typeof extra[p].c2userdata !== "undefined")
					continue;
				ret[p] = extra[p];
			}
		}
		return ret;
	};
	Runtime.prototype.saveToJSONString = function()
	{
		var i, len, j, lenj, type, layout, typeobj, g, c, a, v, p;
		var o = {
			"c2save":				true,
			"version":				1,
			"rt": {
				"time":				this.kahanTime.sum,
				"timescale":		this.timescale,
				"tickcount":		this.tickcount,
				"execcount":		this.execcount,
				"next_uid":			this.next_uid,
				"running_layout":	this.running_layout.sid,
				"start_time_offset": (Date.now() - this.start_time)
			},
			"types": {},
			"layouts": {},
			"events": {
				"groups": {},
				"cnds": {},
				"acts": {},
				"vars": {}
			}
		};
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family || this.typeHasNoSaveBehavior(type))
				continue;
			typeobj = {
				"instances": []
			};
			if (cr.hasAnyOwnProperty(type.extra))
				typeobj["ex"] = CopyExtraObject(type.extra);
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				typeobj["instances"].push(this.saveInstanceToJSON(type.instances[j]));
			}
			o["types"][type.sid.toString()] = typeobj;
		}
		for (i = 0, len = this.layouts_by_index.length; i < len; i++)
		{
			layout = this.layouts_by_index[i];
			o["layouts"][layout.sid.toString()] = layout.saveToJSON();
		}
		var ogroups = o["events"]["groups"];
		for (i = 0, len = this.allGroups.length; i < len; i++)
		{
			g = this.allGroups[i];
			ogroups[g.sid.toString()] = !!this.activeGroups[g.group_name];
		}
		var ocnds = o["events"]["cnds"];
		for (p in this.cndsBySid)
		{
			if (this.cndsBySid.hasOwnProperty(p))
			{
				c = this.cndsBySid[p];
				if (cr.hasAnyOwnProperty(c.extra))
					ocnds[p] = { "ex": CopyExtraObject(c.extra) };
			}
		}
		var oacts = o["events"]["acts"];
		for (p in this.actsBySid)
		{
			if (this.actsBySid.hasOwnProperty(p))
			{
				a = this.actsBySid[p];
				if (cr.hasAnyOwnProperty(a.extra))
					oacts[p] = { "ex": a.extra };
			}
		}
		var ovars = o["events"]["vars"];
		for (p in this.varsBySid)
		{
			if (this.varsBySid.hasOwnProperty(p))
			{
				v = this.varsBySid[p];
				if (!v.is_constant && (!v.parent || v.is_static))
					ovars[p] = v.data;
			}
		}
		o["system"] = this.system.saveToJSON();
		return JSON.stringify(o);
	};
	Runtime.prototype.refreshUidMap = function ()
	{
		var i, len, type, j, lenj, inst;
		this.objectsByUid = {};
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				this.objectsByUid[inst.uid.toString()] = inst;
			}
		}
	};
	Runtime.prototype.loadFromJSONString = function (str)
	{
		var o = JSON.parse(str);
		if (!o["c2save"])
			return;		// probably not a c2 save state
		if (o["version"] > 1)
			return;		// from future version of c2; assume not compatible
		var rt = o["rt"];
		this.kahanTime.reset();
		this.kahanTime.sum = rt["time"];
		this.timescale = rt["timescale"];
		this.tickcount = rt["tickcount"];
		this.execcount = rt["execcount"];
		this.start_time = Date.now() - rt["start_time_offset"];
		var layout_sid = rt["running_layout"];
		if (layout_sid !== this.running_layout.sid)
		{
			var changeToLayout = this.getLayoutBySid(layout_sid);
			if (changeToLayout)
				this.doChangeLayout(changeToLayout);
			else
				return;		// layout that was saved on has gone missing (deleted?)
		}
		this.isLoadingState = true;
		var i, len, j, lenj, k, lenk, p, type, existing_insts, load_insts, inst, binst, layout, layer, g, iid, t;
		var otypes = o["types"];
		for (p in otypes)
		{
			if (otypes.hasOwnProperty(p))
			{
				type = this.getObjectTypeBySid(parseInt(p, 10));
				if (!type || type.is_family || this.typeHasNoSaveBehavior(type))
					continue;
				if (otypes[p]["ex"])
					type.extra = otypes[p]["ex"];
				else
					cr.wipe(type.extra);
				existing_insts = type.instances;
				load_insts = otypes[p]["instances"];
				for (i = 0, len = cr.min(existing_insts.length, load_insts.length); i < len; i++)
				{
					this.loadInstanceFromJSON(existing_insts[i], load_insts[i]);
				}
				for (i = load_insts.length, len = existing_insts.length; i < len; i++)
					this.DestroyInstance(existing_insts[i]);
				for (i = existing_insts.length, len = load_insts.length; i < len; i++)
				{
					layer = null;
					if (type.plugin.is_world)
					{
						layer = this.running_layout.getLayerBySid(load_insts[i]["w"]["l"]);
						if (!layer)
							continue;
					}
					inst = this.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
					this.loadInstanceFromJSON(inst, load_insts[i]);
				}
				type.stale_iids = true;
			}
		}
		this.ClearDeathRow();
		this.refreshUidMap();
		var olayouts = o["layouts"];
		for (p in olayouts)
		{
			if (olayouts.hasOwnProperty(p))
			{
				layout = this.getLayoutBySid(parseInt(p, 10));
				if (!layout)
					continue;		// must've gone missing
				layout.loadFromJSON(olayouts[p]);
			}
		}
		var ogroups = o["events"]["groups"];
		for (p in ogroups)
		{
			if (ogroups.hasOwnProperty(p))
			{
				g = this.getGroupBySid(parseInt(p, 10));
				if (g)
					this.activeGroups[g.group_name] = ogroups[p];
			}
		}
		var ocnds = o["events"]["cnds"];
		for (p in ocnds)
		{
			if (ocnds.hasOwnProperty(p) && this.cndsBySid.hasOwnProperty(p))
			{
				this.cndsBySid[p].extra = ocnds[p]["ex"];
			}
		}
		var oacts = o["events"]["acts"];
		for (p in oacts)
		{
			if (oacts.hasOwnProperty(p) && this.actsBySid.hasOwnProperty(p))
			{
				this.actsBySid[p].extra = oacts[p]["ex"];
			}
		}
		var ovars = o["events"]["vars"];
		for (p in ovars)
		{
			if (ovars.hasOwnProperty(p) && this.varsBySid.hasOwnProperty(p))
			{
				this.varsBySid[p].data = ovars[p];
			}
		}
		this.next_uid = rt["next_uid"];
		this.isLoadingState = false;
		this.system.loadFromJSON(o["system"]);
		for (i = 0, len = this.types_by_index.length; i < len; i++)
		{
			type = this.types_by_index[i];
			if (type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
			{
				inst = type.instances[j];
				if (type.is_contained)
				{
					iid = inst.get_iid();
					inst.siblings.length = 0;
					for (k = 0, lenk = type.container.length; k < lenk; k++)
					{
						t = type.container[k];
						if (type === t)
							continue;
;
						inst.siblings.push(t.instances[iid]);
					}
				}
				if (inst.afterLoad)
					inst.afterLoad();
				if (inst.behavior_insts)
				{
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++)
					{
						binst = inst.behavior_insts[k];
						if (binst.afterLoad)
							binst.afterLoad();
					}
				}
			}
		}
		this.redraw = true;
	};
	Runtime.prototype.saveInstanceToJSON = function(inst)
	{
		var i, len, world, behinst, et;
		var type = inst.type;
		var plugin = type.plugin;
		var o = {
			"uid": inst.uid
		};
		if (cr.hasAnyOwnProperty(inst.extra))
			o["ex"] = CopyExtraObject(inst.extra);
		if (inst.instance_vars && inst.instance_vars.length)
		{
			o["ivs"] = {};
			for (i = 0, len = inst.instance_vars.length; i < len; i++)
			{
				o["ivs"][inst.type.instvar_sids[i].toString()] = inst.instance_vars[i];
			}
		}
		if (plugin.is_world)
		{
			world = {
				"x": inst.x,
				"y": inst.y,
				"w": inst.width,
				"h": inst.height,
				"l": inst.layer.sid,
				"zi": inst.get_zindex()
			};
			if (inst.angle !== 0)
				world["a"] = inst.angle;
			if (inst.opacity !== 1)
				world["o"] = inst.opacity;
			if (inst.hotspotX !== 0.5)
				world["hX"] = inst.hotspotX;
			if (inst.hotspotY !== 0.5)
				world["hY"] = inst.hotspotY;
			if (inst.blend_mode !== 0)
				world["bm"] = inst.blend_mode;
			if (!inst.visible)
				world["v"] = inst.visible;
			if (!inst.collisionsEnabled)
				world["ce"] = inst.collisionsEnabled;
			if (inst.my_timescale !== -1)
				world["mts"] = inst.my_timescale;
			if (type.effect_types.length)
			{
				world["fx"] = [];
				for (i = 0, len = type.effect_types.length; i < len; i++)
				{
					et = type.effect_types[i];
					world["fx"].push({"name": et.name,
									  "active": inst.active_effect_flags[et.index],
									  "params": inst.effect_params[et.index] });
				}
			}
			o["w"] = world;
		}
		if (inst.behavior_insts && inst.behavior_insts.length)
		{
			o["behs"] = {};
			for (i = 0, len = inst.behavior_insts.length; i < len; i++)
			{
				behinst = inst.behavior_insts[i];
				if (behinst.saveToJSON)
					o["behs"][behinst.type.sid.toString()] = behinst.saveToJSON();
			}
		}
		if (inst.saveToJSON)
			o["data"] = inst.saveToJSON();
		return o;
	};
	Runtime.prototype.getInstanceVarIndexBySid = function (type, sid_)
	{
		var i, len;
		for (i = 0, len = type.instvar_sids.length; i < len; i++)
		{
			if (type.instvar_sids[i] === sid_)
				return i;
		}
		return -1;
	};
	Runtime.prototype.getBehaviorIndexBySid = function (inst, sid_)
	{
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++)
		{
			if (inst.behavior_insts[i].type.sid === sid_)
				return i;
		}
		return -1;
	};
	Runtime.prototype.loadInstanceFromJSON = function(inst, o)
	{
		var p, i, len, iv, oivs, world, fxindex, obehs, behindex;
		var oldlayer;
		var type = inst.type;
		var plugin = type.plugin;
		inst.uid = o["uid"];
		if (o["ex"])
			inst.extra = o["ex"];
		else
			cr.wipe(inst.extra);
		oivs = o["ivs"];
		if (oivs)
		{
			for (p in oivs)
			{
				if (oivs.hasOwnProperty(p))
				{
					iv = this.getInstanceVarIndexBySid(type, parseInt(p, 10));
					if (iv < 0 || iv >= inst.instance_vars.length)
						continue;		// must've gone missing
					inst.instance_vars[iv] = oivs[p];
				}
			}
		}
		if (plugin.is_world)
		{
			world = o["w"];
			if (inst.layer.sid !== world["l"])
			{
				oldlayer = inst.layer;
				inst.layer = this.running_layout.getLayerBySid(world["l"]);
				if (inst.layer)
				{
					inst.layer.instances.push(inst);
					inst.layer.zindices_stale = true;
					cr.arrayFindRemove(oldlayer.instances, inst);
					oldlayer.zindices_stale = true;
				}
				else
				{
					inst.layer = oldlayer;
					this.DestroyInstance(inst);
				}
			}
			inst.x = world["x"];
			inst.y = world["y"];
			inst.width = world["w"];
			inst.height = world["h"];
			inst.zindex = world["zi"];
			inst.angle = world.hasOwnProperty("a") ? world["a"] : 0;
			inst.opacity = world.hasOwnProperty("o") ? world["o"] : 1;
			inst.hotspotX = world.hasOwnProperty("hX") ? world["hX"] : 0.5;
			inst.hotspotY = world.hasOwnProperty("hY") ? world["hY"] : 0.5;
			inst.visible = world.hasOwnProperty("v") ? world["v"] : true;
			inst.collisionsEnabled = world.hasOwnProperty("ce") ? world["ce"] : true;
			inst.my_timescale = world.hasOwnProperty("mts") ? world["mts"] : -1;
			inst.blend_mode = world.hasOwnProperty("bm") ? world["bm"] : 0;;
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			inst.set_bbox_changed();
			if (world.hasOwnProperty("fx"))
			{
				for (i = 0, len = world["fx"].length; i < len; i++)
				{
					fxindex = type.getEffectIndexByName(world["fx"][i]["name"]);
					if (fxindex < 0)
						continue;		// must've gone missing
					inst.active_effect_flags[fxindex] = world["fx"][i]["active"];
					inst.effect_params[fxindex] = world["fx"][i]["params"];
				}
			}
			inst.updateActiveEffects();
		}
		obehs = o["behs"];
		if (obehs)
		{
			for (p in obehs)
			{
				if (obehs.hasOwnProperty(p))
				{
					behindex = this.getBehaviorIndexBySid(inst, parseInt(p, 10));
					if (behindex < 0)
						continue;		// must've gone missing
					inst.behavior_insts[behindex].loadFromJSON(obehs[p]);
				}
			}
		}
		if (o["data"])
			inst.loadFromJSON(o["data"]);
	};
	cr.runtime = Runtime;
	cr.createRuntime = function (canvasid)
	{
		return new Runtime(document.getElementById(canvasid));
	};
	cr.createDCRuntime = function (w, h)
	{
		return new Runtime({ "dc": true, "width": w, "height": h });
	};
	window["cr_createRuntime"] = cr.createRuntime;
	window["cr_createDCRuntime"] = cr.createDCRuntime;
	window["createCocoonJSRuntime"] = function ()
	{
		window["c2cocoonjs"] = true;
		var canvas = document.createElement("screencanvas") || document.createElement("canvas");
		document.body.appendChild(canvas);
		var rt = new Runtime(canvas);
		window["c2runtime"] = rt;
		window.addEventListener("orientationchange", function () {
			window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		});
		window["c2runtime"]["setSize"](window.innerWidth, window.innerHeight);
		return rt;
	};
}());
window["cr_getC2Runtime"] = function()
{
	var canvas = document.getElementById("c2canvas");
	if (canvas)
		return canvas["c2runtime"];
	else if (window["c2runtime"])
		return window["c2runtime"];
	else
		return null;
}
window["cr_sizeCanvas"] = function(w, h)
{
	if (w === 0 || h === 0)
		return;
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSize"](w, h);
}
window["cr_setSuspended"] = function(s)
{
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSuspended"](s);
}
;
(function()
{
	function Layout(runtime, m)
	{
		this.runtime = runtime;
		this.event_sheet = null;
		this.scrollX = (this.runtime.original_width / 2);
		this.scrollY = (this.runtime.original_height / 2);
		this.scale = 1.0;
		this.angle = 0;
		this.first_visit = true;
		this.name = m[0];
		this.width = m[1];
		this.height = m[2];
		this.unbounded_scrolling = m[3];
		this.sheetname = m[4];
		this.sid = m[5];
		var lm = m[6];
		var i, len;
		this.layers = [];
		this.initial_types = [];
		for (i = 0, len = lm.length; i < len; i++)
		{
			var layer = new cr.layer(this, lm[i]);
			layer.number = i;
			cr.seal(layer);
			this.layers.push(layer);
		}
		var im = m[7];
		this.initial_nonworld = [];
		for (i = 0, len = im.length; i < len; i++)
		{
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
;
			if (!type.default_instance)
				type.default_instance = inst;
			this.initial_nonworld.push(inst);
			if (this.initial_types.indexOf(type) === -1)
				this.initial_types.push(type);
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.effect_params = [];
		for (i = 0, len = m[8].length; i < len; i++)
		{
			this.effect_types.push({
				id: m[8][i][0],
				name: m[8][i][1],
				shaderindex: -1,
				active: true,
				index: i
			});
			this.effect_params.push(m[8][i][2].slice(0));
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
		this.persist_data = {};
	};
	Layout.prototype.saveObjectToPersist = function (inst)
	{
		var sidStr = inst.type.sid.toString();
		if (!this.persist_data.hasOwnProperty(sidStr))
			this.persist_data[sidStr] = [];
		var type_persist = this.persist_data[sidStr];
		type_persist.push(this.runtime.saveInstanceToJSON(inst));
	};
	Layout.prototype.hasOpaqueBottomLayer = function ()
	{
		var layer = this.layers[0];
		return !layer.transparent && layer.opacity === 1.0 && !layer.forceOwnTexture && layer.visible;
	};
	Layout.prototype.updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.active)
				this.active_effect_types.push(et);
		}
	};
	Layout.prototype.getEffectByName = function (name_)
	{
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.name === name_)
				return et;
		}
		return null;
	};
	var created_instances = [];
	Layout.prototype.startRunning = function ()
	{
		if (this.sheetname)
		{
			this.event_sheet = this.runtime.eventsheets[this.sheetname];
;
		}
		this.runtime.running_layout = this;
		this.scrollX = (this.runtime.original_width / 2);
		this.scrollY = (this.runtime.original_height / 2);
		var i, k, len, lenk, type, type_instances, inst, iid, t, s, p, q, type_data, layer;
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
		{
			type = this.runtime.types_by_index[i];
			if (type.is_family)
				continue;		// instances are only transferred for their real type
			type_instances = type.instances;
			for (k = 0, lenk = type_instances.length; k < lenk; k++)
			{
				inst = type_instances[k];
				if (inst.layer)
				{
					var num = inst.layer.number;
					if (num >= this.layers.length)
						num = this.layers.length - 1;
					inst.layer = this.layers[num];
					inst.layer.instances.push(inst);
					inst.layer.zindices_stale = true;
				}
			}
		}
		var layer;
		created_instances.length = 0;
		this.boundScrolling();
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			layer = this.layers[i];
			layer.createInitialInstances();		// fills created_instances
			layer.disableAngle = true;
			var px = layer.canvasToLayer(0, 0, true);
			var py = layer.canvasToLayer(0, 0, false);
			layer.disableAngle = false;
			if (this.runtime.pixel_rounding)
			{
				px = (px + 0.5) | 0;
				py = (py + 0.5) | 0;
			}
			layer.rotateViewport(px, py, null);
		}
		var uids_changed = false;
		if (!this.first_visit)
		{
			for (p in this.persist_data)
			{
				if (this.persist_data.hasOwnProperty(p))
				{
					type = this.runtime.getObjectTypeBySid(parseInt(p, 10));
					if (!type || type.is_family || !this.runtime.typeHasPersistBehavior(type))
						continue;
					type_data = this.persist_data[p];
					for (i = 0, len = type_data.length; i < len; i++)
					{
						layer = null;
						if (type.plugin.is_world)
						{
							layer = this.getLayerBySid(type_data[i]["w"]["l"]);
							if (!layer)
								continue;
						}
						inst = this.runtime.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
						this.runtime.loadInstanceFromJSON(inst, type_data[i]);
						uids_changed = true;
						created_instances.push(inst);
					}
					type_data.length = 0;
				}
			}
			for (i = 0, len = this.layers.length; i < len; i++)
			{
				this.layers[i].instances.sort(sortInstanceByZIndex);
				this.layers[i].zindices_stale = true;		// in case of duplicates/holes
			}
		}
		if (uids_changed)
		{
			this.runtime.ClearDeathRow();
			this.runtime.refreshUidMap();
		}
		for (i = 0; i < created_instances.length; i++)
		{
			inst = created_instances[i];
			if (!inst.type.is_contained)
				continue;
			iid = inst.get_iid();
			for (k = 0, lenk = inst.type.container.length; k < lenk; k++)
			{
				t = inst.type.container[k];
				if (inst.type === t)
					continue;
				if (t.instances.length > iid)
					inst.siblings.push(t.instances[iid]);
				else
				{
					if (!t.default_instance)
					{
					}
					else
					{
						s = this.runtime.createInstanceFromInit(t.default_instance, inst.layer, true, inst.x, inst.y, true);
						this.runtime.ClearDeathRow();
						t.updateIIDs();
						inst.siblings.push(s);
						created_instances.push(s);		// come back around and link up its own instances too
					}
				}
			}
		}
		for (i = 0, len = this.initial_nonworld.length; i < len; i++)
		{
			inst = this.runtime.createInstanceFromInit(this.initial_nonworld[i], null, true);
;
		}
		this.runtime.changelayout = null;
		this.runtime.ClearDeathRow();
		if (this.runtime.ctx && !this.runtime.isDomFree)
		{
			for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
			{
				t = this.runtime.types_by_index[i];
				if (t.is_family || !t.instances.length || !t.preloadCanvas2D)
					continue;
				t.preloadCanvas2D(this.runtime.ctx);
			}
		}
		/*
		if (this.runtime.glwrap)
		{
			console.log("Estimated VRAM at layout start: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
		}
		*/
		for (i = 0, len = created_instances.length; i < len; i++)
		{
			inst = created_instances[i];
			this.runtime.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst);
		}
		created_instances.length = 0;
		this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutStart, null);
		this.first_visit = false;
	};
	Layout.prototype.createGlobalNonWorlds = function ()
	{
		var i, k, len, initial_inst, inst, type;
		for (i = 0, k = 0, len = this.initial_nonworld.length; i < len; i++)
		{
			initial_inst = this.initial_nonworld[i];
			type = this.runtime.types_by_index[initial_inst[1]];
			if (type.global)
				inst = this.runtime.createInstanceFromInit(initial_inst, null, true);
			else
			{
				this.initial_nonworld[k] = initial_inst;
				k++;
			}
		}
		this.initial_nonworld.length = k;
	};
	Layout.prototype.stopRunning = function ()
	{
;
		/*
		if (this.runtime.glwrap)
		{
			console.log("Estimated VRAM at layout end: " + this.runtime.glwrap.textureCount() + " textures, approx. " + Math.round(this.runtime.glwrap.estimateVRAM() / 1024) + " kb");
		}
		*/
		this.runtime.trigger(cr.system_object.prototype.cnds.OnLayoutEnd, null);
		this.runtime.system.waits.length = 0;
		var i, leni, j, lenj;
		var layer_instances, inst, type;
		for (i = 0, leni = this.layers.length; i < leni; i++)
		{
			layer_instances = this.layers[i].instances;
			for (j = 0, lenj = layer_instances.length; j < lenj; j++)
			{
				inst = layer_instances[j];
				if (!inst.type.global)
				{
					if (this.runtime.typeHasPersistBehavior(inst.type))
						this.saveObjectToPersist(inst);
					this.runtime.DestroyInstance(inst);
				}
			}
			this.runtime.ClearDeathRow();
			layer_instances.length = 0;
			this.layers[i].zindices_stale = true;
		}
		for (i = 0, leni = this.runtime.types_by_index.length; i < leni; i++)
		{
			type = this.runtime.types_by_index[i];
			if (type.global || type.plugin.is_world || type.plugin.singleglobal || type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++)
				this.runtime.DestroyInstance(type.instances[j]);
			this.runtime.ClearDeathRow();
		}
	};
	Layout.prototype.draw = function (ctx)
	{
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";
		if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
			ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
		var i, len, l;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			l = this.layers[i];
			if (l.visible && l.opacity > 0 && l.blend_mode !== 11)
				l.draw(ctx);
		}
	};
	Layout.prototype.drawGL = function (glw)
	{
		var render_to_texture = (this.active_effect_types.length > 0 || this.runtime.uses_background_blending);
		if (render_to_texture)
		{
			if (!this.runtime.layout_tex)
			{
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			if (this.runtime.layout_tex.c2width !== this.runtime.width || this.runtime.layout_tex.c2height !== this.runtime.height)
			{
				glw.deleteTexture(this.runtime.layout_tex);
				this.runtime.layout_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			glw.setRenderingToTexture(this.runtime.layout_tex);
		}
		if (this.runtime.clearBackground && !this.hasOpaqueBottomLayer())
			glw.clear(0, 0, 0, 0);
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			if (this.layers[i].visible && this.layers[i].opacity > 0)
				this.layers[i].drawGL(glw);
		}
		if (render_to_texture)
		{
			if (this.active_effect_types.length <= 1)
			{
				if (this.active_effect_types.length === 1)
				{
					var etindex = this.active_effect_types[0].index;
					glw.switchProgram(this.active_effect_types[0].shaderindex);
					glw.setProgramParameters(null,								// backTex
											 1.0 / this.runtime.width,			// pixelWidth
											 1.0 / this.runtime.height,			// pixelHeight
											 0.0, 0.0,							// destStart
											 1.0, 1.0,							// destEnd
											 this.scale,						// layerScale
											 this.effect_params[etindex]);		// fx parameters
					if (glw.programIsAnimated(this.active_effect_types[0].shaderindex))
						this.runtime.redraw = true;
				}
				else
					glw.switchProgram(0);
				glw.setRenderingToTexture(null);				// to backbuffer
				glw.setOpacity(1);
				glw.setTexture(this.runtime.layout_tex);
				glw.setAlphaBlend();
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.width / 2;
				var halfh = this.runtime.height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
			}
			else
			{
				this.renderEffectChain(glw, null, null, null);
			}
		}
	};
	Layout.prototype.getRenderTarget = function()
	{
		return (this.active_effect_types.length > 0 || this.runtime.uses_background_blending) ? this.runtime.layout_tex : null;
	};
	Layout.prototype.getMinLayerScale = function ()
	{
		var m = this.layers[0].getScale();
		var i, len, l;
		for (i = 1, len = this.layers.length; i < len; i++)
		{
			l = this.layers[i];
			if (l.parallaxX === 0 && l.parallaxY === 0)
				continue;
			if (l.getScale() < m)
				m = l.getScale();
		}
		return m;
	};
	Layout.prototype.scrollToX = function (x)
	{
		if (!this.unbounded_scrolling)
		{
			var widthBoundary = (this.runtime.width * (1 / this.getMinLayerScale()) / 2);
			if (x > this.width - widthBoundary)
				x = this.width - widthBoundary;
			if (x < widthBoundary)
				x = widthBoundary;
		}
		if (this.scrollX !== x)
		{
			this.scrollX = x;
			this.runtime.redraw = true;
		}
	};
	Layout.prototype.scrollToY = function (y)
	{
		if (!this.unbounded_scrolling)
		{
			var heightBoundary = (this.runtime.height * (1 / this.getMinLayerScale()) / 2);
			if (y > this.height - heightBoundary)
				y = this.height - heightBoundary;
			if (y < heightBoundary)
				y = heightBoundary;
		}
		if (this.scrollY !== y)
		{
			this.scrollY = y;
			this.runtime.redraw = true;
		}
	};
	Layout.prototype.boundScrolling = function ()
	{
		this.scrollToX(this.scrollX);
		this.scrollToY(this.scrollY);
	};
	Layout.prototype.renderEffectChain = function (glw, layer, inst, rendertarget)
	{
		var active_effect_types = inst ?
							inst.active_effect_types :
							layer ?
								layer.active_effect_types :
								this.active_effect_types;
		var layerScale = inst ? inst.layer.getScale() :
							layer ? layer.getScale() : 1;
		var fx_tex = this.runtime.fx_tex;
		var i, len, last, temp, fx_index = 0, other_fx_index = 1;
		var y, h;
		var windowWidth = this.runtime.width;
		var windowHeight = this.runtime.height;
		var halfw = windowWidth / 2;
		var halfh = windowHeight / 2;
		var rcTex = layer ? layer.rcTex : this.rcTex;
		var rcTex2 = layer ? layer.rcTex2 : this.rcTex2;
		var screenleft = 0, clearleft = 0;
		var screentop = 0, cleartop = 0;
		var screenright = windowWidth, clearright = windowWidth;
		var screenbottom = windowHeight, clearbottom = windowHeight;
		var boxExtendHorizontal = 0;
		var boxExtendVertical = 0;
		var inst_layer_angle = inst ? inst.layer.getAngle() : 0;
		if (inst)
		{
			for (i = 0, len = active_effect_types.length; i < len; i++)
			{
				boxExtendHorizontal += glw.getProgramBoxExtendHorizontal(active_effect_types[i].shaderindex);
				boxExtendVertical += glw.getProgramBoxExtendVertical(active_effect_types[i].shaderindex);
			}
			var bbox = inst.bbox;
			screenleft = layer.layerToCanvas(bbox.left, bbox.top, true);
			screentop = layer.layerToCanvas(bbox.left, bbox.top, false);
			screenright = layer.layerToCanvas(bbox.right, bbox.bottom, true);
			screenbottom = layer.layerToCanvas(bbox.right, bbox.bottom, false);
			if (inst_layer_angle !== 0)
			{
				var screentrx = layer.layerToCanvas(bbox.right, bbox.top, true);
				var screentry = layer.layerToCanvas(bbox.right, bbox.top, false);
				var screenblx = layer.layerToCanvas(bbox.left, bbox.bottom, true);
				var screenbly = layer.layerToCanvas(bbox.left, bbox.bottom, false);
				temp = Math.min(screenleft, screenright, screentrx, screenblx);
				screenright = Math.max(screenleft, screenright, screentrx, screenblx);
				screenleft = temp;
				temp = Math.min(screentop, screenbottom, screentry, screenbly);
				screenbottom = Math.max(screentop, screenbottom, screentry, screenbly);
				screentop = temp;
			}
			screenleft -= boxExtendHorizontal;
			screentop -= boxExtendVertical;
			screenright += boxExtendHorizontal;
			screenbottom += boxExtendVertical;
			rcTex2.left = screenleft / windowWidth;
			rcTex2.top = 1 - screentop / windowHeight;
			rcTex2.right = screenright / windowWidth;
			rcTex2.bottom = 1 - screenbottom / windowHeight;
			clearleft = screenleft = Math.floor(screenleft);
			cleartop = screentop = Math.floor(screentop);
			clearright = screenright = Math.ceil(screenright);
			clearbottom = screenbottom = Math.ceil(screenbottom);
			clearleft -= boxExtendHorizontal;
			cleartop -= boxExtendVertical;
			clearright += boxExtendHorizontal;
			clearbottom += boxExtendVertical;
			if (screenleft < 0)					screenleft = 0;
			if (screentop < 0)					screentop = 0;
			if (screenright > windowWidth)		screenright = windowWidth;
			if (screenbottom > windowHeight)	screenbottom = windowHeight;
			if (clearleft < 0)					clearleft = 0;
			if (cleartop < 0)					cleartop = 0;
			if (clearright > windowWidth)		clearright = windowWidth;
			if (clearbottom > windowHeight)		clearbottom = windowHeight;
			rcTex.left = screenleft / windowWidth;
			rcTex.top = 1 - screentop / windowHeight;
			rcTex.right = screenright / windowWidth;
			rcTex.bottom = 1 - screenbottom / windowHeight;
		}
		else
		{
			rcTex.left = rcTex2.left = 0;
			rcTex.top = rcTex2.top = 0;
			rcTex.right = rcTex2.right = 1;
			rcTex.bottom = rcTex2.bottom = 1;
		}
		var pre_draw = (inst && (((inst.angle || inst_layer_angle) && glw.programUsesDest(active_effect_types[0].shaderindex)) || boxExtendHorizontal !== 0 || boxExtendVertical !== 0 || inst.opacity !== 1 || inst.type.plugin.must_predraw)) || (layer && !inst && layer.opacity !== 1);
		glw.setAlphaBlend();
		if (pre_draw)
		{
			if (!fx_tex[fx_index])
			{
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
			{
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			glw.switchProgram(0);
			glw.setRenderingToTexture(fx_tex[fx_index]);
			h = clearbottom - cleartop;
			y = (windowHeight - cleartop) - h;
			glw.clearRect(clearleft, y, clearright - clearleft, h);
			if (inst)
			{
				inst.drawGL(glw);
			}
			else
			{
				glw.setTexture(this.runtime.layer_tex);
				glw.setOpacity(layer.opacity);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			}
			rcTex2.left = rcTex2.top = 0;
			rcTex2.right = rcTex2.bottom = 1;
			if (inst)
			{
				temp = rcTex.top;
				rcTex.top = rcTex.bottom;
				rcTex.bottom = temp;
			}
			fx_index = 1;
			other_fx_index = 0;
		}
		glw.setOpacity(1);
		var last = active_effect_types.length - 1;
		var post_draw = glw.programUsesCrossSampling(active_effect_types[last].shaderindex);
		var etindex = 0;
		for (i = 0, len = active_effect_types.length; i < len; i++)
		{
			if (!fx_tex[fx_index])
			{
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			if (fx_tex[fx_index].c2width !== windowWidth || fx_tex[fx_index].c2height !== windowHeight)
			{
				glw.deleteTexture(fx_tex[fx_index]);
				fx_tex[fx_index] = glw.createEmptyTexture(windowWidth, windowHeight, this.runtime.linearSampling);
			}
			glw.switchProgram(active_effect_types[i].shaderindex);
			etindex = active_effect_types[i].index;
			if (glw.programIsAnimated(active_effect_types[i].shaderindex))
				this.runtime.redraw = true;
			if (i == 0 && !pre_draw)
			{
				glw.setRenderingToTexture(fx_tex[fx_index]);
				h = clearbottom - cleartop;
				y = (windowHeight - cleartop) - h;
				glw.clearRect(clearleft, y, clearright - clearleft, h);
				if (inst)
				{
					glw.setProgramParameters(rendertarget,					// backTex
											 1.0 / inst.width,				// pixelWidth
											 1.0 / inst.height,				// pixelHeight
											 rcTex2.left, rcTex2.top,		// destStart
											 rcTex2.right, rcTex2.bottom,	// destEnd
											 layerScale,
											 inst.effect_params[etindex]);	// fx params
					inst.drawGL(glw);
				}
				else
				{
					glw.setProgramParameters(rendertarget,					// backTex
											 1.0 / windowWidth,				// pixelWidth
											 1.0 / windowHeight,			// pixelHeight
											 0.0, 0.0,						// destStart
											 1.0, 1.0,						// destEnd
											 layerScale,
											 layer ?						// fx params
												layer.effect_params[etindex] :
												this.effect_params[etindex]);
					glw.setTexture(layer ? this.runtime.layer_tex : this.runtime.layout_tex);
					glw.resetModelView();
					glw.translate(-halfw, -halfh);
					glw.updateModelView();
					glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				}
				rcTex2.left = rcTex2.top = 0;
				rcTex2.right = rcTex2.bottom = 1;
				if (inst && !post_draw)
				{
					temp = screenbottom;
					screenbottom = screentop;
					screentop = temp;
				}
			}
			else
			{
				glw.setProgramParameters(rendertarget,						// backTex
										 1.0 / windowWidth,					// pixelWidth
										 1.0 / windowHeight,				// pixelHeight
										 rcTex2.left, rcTex2.top,			// destStart
										 rcTex2.right, rcTex2.bottom,		// destEnd
										 layerScale,
										 inst ?								// fx params
											inst.effect_params[etindex] :
											layer ?
												layer.effect_params[etindex] :
												this.effect_params[etindex]);
				if (i === last && !post_draw)
				{
					if (inst)
						glw.setBlend(inst.srcBlend, inst.destBlend);
					else if (layer)
						glw.setBlend(layer.srcBlend, layer.destBlend);
					glw.setRenderingToTexture(rendertarget);
				}
				else
				{
					glw.setRenderingToTexture(fx_tex[fx_index]);
					h = clearbottom - cleartop;
					y = (windowHeight - cleartop) - h;
					glw.clearRect(clearleft, y, clearright - clearleft, h);
				}
				glw.setTexture(fx_tex[other_fx_index]);
				glw.resetModelView();
				glw.translate(-halfw, -halfh);
				glw.updateModelView();
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
				if (i === last && !post_draw)
					glw.setTexture(null);
			}
			fx_index = (fx_index === 0 ? 1 : 0);
			other_fx_index = (fx_index === 0 ? 1 : 0);		// will be opposite to fx_index since it was just assigned
		}
		if (post_draw)
		{
			glw.switchProgram(0);
			if (inst)
				glw.setBlend(inst.srcBlend, inst.destBlend);
			else if (layer)
				glw.setBlend(layer.srcBlend, layer.destBlend);
			glw.setRenderingToTexture(rendertarget);
			glw.setTexture(fx_tex[other_fx_index]);
			glw.resetModelView();
			glw.translate(-halfw, -halfh);
			glw.updateModelView();
			if (inst && active_effect_types.length === 1 && !pre_draw)
				glw.quadTex(screenleft, screentop, screenright, screentop, screenright, screenbottom, screenleft, screenbottom, rcTex);
			else
				glw.quadTex(screenleft, screenbottom, screenright, screenbottom, screenright, screentop, screenleft, screentop, rcTex);
			glw.setTexture(null);
		}
	};
	Layout.prototype.getLayerBySid = function (sid_)
	{
		var i, len;
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			if (this.layers[i].sid === sid_)
				return this.layers[i];
		}
		return null;
	};
	Layout.prototype.saveToJSON = function ()
	{
		var i, len, layer, et;
		var o = {
			"sx": this.scrollX,
			"sy": this.scrollY,
			"s": this.scale,
			"a": this.angle,
			"w": this.width,
			"h": this.height,
			"fv": this.first_visit,			// added r127
			"persist": this.persist_data,
			"fx": [],
			"layers": {}
		};
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			o["fx"].push({"name": et.name, "active": et.active, "params": this.effect_params[et.index] });
		}
		for (i = 0, len = this.layers.length; i < len; i++)
		{
			layer = this.layers[i];
			o["layers"][layer.sid.toString()] = layer.saveToJSON();
		}
		return o;
	};
	Layout.prototype.loadFromJSON = function (o)
	{
		var i, len, fx, p, layer;
		this.scrollX = o["sx"];
		this.scrollY = o["sy"];
		this.scale = o["s"];
		this.angle = o["a"];
		this.width = o["w"];
		this.height = o["h"];
		this.persist_data = o["persist"];
		if (typeof o["fv"] !== "undefined")
			this.first_visit = o["fv"];
		var ofx = o["fx"];
		for (i = 0, len = ofx.length; i < len; i++)
		{
			fx = this.getEffectByName(ofx[i]["name"]);
			if (!fx)
				continue;		// must've gone missing
			fx.active = ofx[i]["active"];
			this.effect_params[fx.index] = ofx[i]["params"];
		}
		this.updateActiveEffects();
		var olayers = o["layers"];
		for (p in olayers)
		{
			if (olayers.hasOwnProperty(p))
			{
				layer = this.getLayerBySid(parseInt(p, 10));
				if (!layer)
					continue;		// must've gone missing
				layer.loadFromJSON(olayers[p]);
			}
		}
	};
	cr.layout = Layout;
	function Layer(layout, m)
	{
		this.layout = layout;
		this.runtime = layout.runtime;
		this.instances = [];        // running instances
		this.scale = 1.0;
		this.angle = 0;
		this.disableAngle = false;
		this.tmprect = new cr.rect(0, 0, 0, 0);
		this.tmpquad = new cr.quad();
		this.viewLeft = 0;
		this.viewRight = 0;
		this.viewTop = 0;
		this.viewBottom = 0;
		this.zindices_stale = false;
		this.name = m[0];
		this.index = m[1];
		this.sid = m[2];
		this.visible = m[3];		// initially visible
		this.background_color = m[4];
		this.transparent = m[5];
		this.parallaxX = m[6];
		this.parallaxY = m[7];
		this.opacity = m[8];
		this.forceOwnTexture = m[9];
		this.zoomRate = m[10];
		this.blend_mode = m[11];
		this.effect_fallback = m[12];
		this.compositeOp = "source-over";
		this.srcBlend = 0;
		this.destBlend = 0;
		this.render_offscreen = false;
		var im = m[13];
		var i, len;
		this.initial_instances = [];
		for (i = 0, len = im.length; i < len; i++)
		{
			var inst = im[i];
			var type = this.runtime.types_by_index[inst[1]];
;
			if (!type.default_instance)
				type.default_instance = inst;
			this.initial_instances.push(inst);
			if (this.layout.initial_types.indexOf(type) === -1)
				this.layout.initial_types.push(type);
		}
		this.effect_types = [];
		this.active_effect_types = [];
		this.effect_params = [];
		for (i = 0, len = m[14].length; i < len; i++)
		{
			this.effect_types.push({
				id: m[14][i][0],
				name: m[14][i][1],
				shaderindex: -1,
				active: true,
				index: i
			});
			this.effect_params.push(m[14][i][2].slice(0));
		}
		this.updateActiveEffects();
		this.rcTex = new cr.rect(0, 0, 1, 1);
		this.rcTex2 = new cr.rect(0, 0, 1, 1);
	};
	Layer.prototype.updateActiveEffects = function ()
	{
		this.active_effect_types.length = 0;
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.active)
				this.active_effect_types.push(et);
		}
	};
	Layer.prototype.getEffectByName = function (name_)
	{
		var i, len, et;
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			if (et.name === name_)
				return et;
		}
		return null;
	};
	Layer.prototype.createInitialInstances = function ()
	{
		var i, k, len, inst, initial_inst, type, keep, hasPersistBehavior;
		for (i = 0, k = 0, len = this.initial_instances.length; i < len; i++)
		{
			initial_inst = this.initial_instances[i];
			type = this.runtime.types_by_index[initial_inst[1]];
;
			hasPersistBehavior = this.runtime.typeHasPersistBehavior(type);
			keep = true;
			if (!hasPersistBehavior || this.layout.first_visit)
			{
				inst = this.runtime.createInstanceFromInit(initial_inst, this, true);
;
				created_instances.push(inst);
				if (inst.type.global)
					keep = false;
			}
			if (keep)
			{
				this.initial_instances[k] = this.initial_instances[i];
				k++;
			}
		}
		this.initial_instances.length = k;
		this.runtime.ClearDeathRow();		// flushes creation row so IIDs will be correct
		if (!this.runtime.glwrap && this.effect_types.length)	// no WebGL renderer and shaders used
			this.blend_mode = this.effect_fallback;				// use fallback blend mode
		this.compositeOp = cr.effectToCompositeOp(this.blend_mode);
		if (this.runtime.gl)
			cr.setGLBlend(this, this.blend_mode, this.runtime.gl);
	};
	Layer.prototype.updateZIndices = function ()
	{
		if (!this.zindices_stale)
			return;
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
;
;
			this.instances[i].zindex = i;
		}
		this.zindices_stale = false;
	};
	Layer.prototype.getScale = function ()
	{
		return this.getNormalScale() * this.runtime.aspect_scale;
	};
	Layer.prototype.getNormalScale = function ()
	{
		return ((this.scale * this.layout.scale) - 1) * this.zoomRate + 1;
	};
	Layer.prototype.getAngle = function ()
	{
		if (this.disableAngle)
			return 0;
		return cr.clamp_angle(this.layout.angle + this.angle);
	};
	Layer.prototype.draw = function (ctx)
	{
		this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.blend_mode !== 0);
		var layer_canvas = this.runtime.canvas;
		var layer_ctx = ctx;
		ctx.globalAlpha = 1;
		ctx.globalCompositeOperation = "source-over";
		if (this.render_offscreen)
		{
			if (!this.runtime.layer_canvas)
			{
				this.runtime.layer_canvas = document.createElement("canvas");
;
				layer_canvas = this.runtime.layer_canvas;
				layer_canvas.width = this.runtime.width;
				layer_canvas.height = this.runtime.height;
				this.runtime.layer_ctx = layer_canvas.getContext("2d");
;
			}
			layer_canvas = this.runtime.layer_canvas;
			layer_ctx = this.runtime.layer_ctx;
			if (layer_canvas.width !== this.runtime.width)
				layer_canvas.width = this.runtime.width;
			if (layer_canvas.height !== this.runtime.height)
				layer_canvas.height = this.runtime.height;
			if (this.transparent)
				layer_ctx.clearRect(0, 0, this.runtime.width, this.runtime.height);
		}
		if (!this.transparent)
		{
			layer_ctx.fillStyle = "rgb(" + this.background_color[0] + "," + this.background_color[1] + "," + this.background_color[2] + ")";
			layer_ctx.fillRect(0, 0, this.runtime.width, this.runtime.height);
		}
		layer_ctx.save();
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true);
		var py = this.canvasToLayer(0, 0, false);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding)
		{
			px = (px + 0.5) | 0;
			py = (py + 0.5) | 0;
		}
		this.rotateViewport(px, py, layer_ctx);
		var myscale = this.getScale();
		layer_ctx.scale(myscale, myscale);
		layer_ctx.translate(-px, -py);
		var i, len, inst, bbox;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			if (!inst.visible || inst.width === 0 || inst.height === 0)
				continue;
			inst.update_bbox();
			bbox = inst.bbox;
			if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
				continue;
			layer_ctx.globalCompositeOperation = inst.compositeOp;
			inst.draw(layer_ctx);
		}
		layer_ctx.restore();
		if (this.render_offscreen)
		{
			ctx.globalCompositeOperation = this.compositeOp;
			ctx.globalAlpha = this.opacity;
			ctx.drawImage(layer_canvas, 0, 0);
		}
	};
	Layer.prototype.rotateViewport = function (px, py, ctx)
	{
		var myscale = this.getScale();
		this.viewLeft = px;
		this.viewTop = py;
		this.viewRight = px + (this.runtime.width * (1 / myscale));
		this.viewBottom = py + (this.runtime.height * (1 / myscale));
		var myAngle = this.getAngle();
		if (myAngle !== 0)
		{
			if (ctx)
			{
				ctx.translate(this.runtime.width / 2, this.runtime.height / 2);
				ctx.rotate(-myAngle);
				ctx.translate(this.runtime.width / -2, this.runtime.height / -2);
			}
			this.tmprect.set(this.viewLeft, this.viewTop, this.viewRight, this.viewBottom);
			this.tmprect.offset((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
			this.tmpquad.set_from_rotated_rect(this.tmprect, myAngle);
			this.tmpquad.bounding_box(this.tmprect);
			this.tmprect.offset((this.viewLeft + this.viewRight) / 2, (this.viewTop + this.viewBottom) / 2);
			this.viewLeft = this.tmprect.left;
			this.viewTop = this.tmprect.top;
			this.viewRight = this.tmprect.right;
			this.viewBottom = this.tmprect.bottom;
		}
	}
	Layer.prototype.drawGL = function (glw)
	{
		var windowWidth = this.runtime.width;
		var windowHeight = this.runtime.height;
		var shaderindex = 0;
		var etindex = 0;
		this.render_offscreen = (this.forceOwnTexture || this.opacity !== 1.0 || this.active_effect_types.length > 0 || this.blend_mode !== 0);
		if (this.render_offscreen)
		{
			if (!this.runtime.layer_tex)
			{
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			if (this.runtime.layer_tex.c2width !== this.runtime.width || this.runtime.layer_tex.c2height !== this.runtime.height)
			{
				glw.deleteTexture(this.runtime.layer_tex);
				this.runtime.layer_tex = glw.createEmptyTexture(this.runtime.width, this.runtime.height, this.runtime.linearSampling);
			}
			glw.setRenderingToTexture(this.runtime.layer_tex);
			if (this.transparent)
				glw.clear(0, 0, 0, 0);
		}
		if (!this.transparent)
		{
			glw.clear(this.background_color[0] / 255, this.background_color[1] / 255, this.background_color[2] / 255, 1);
		}
		this.disableAngle = true;
		var px = this.canvasToLayer(0, 0, true);
		var py = this.canvasToLayer(0, 0, false);
		this.disableAngle = false;
		if (this.runtime.pixel_rounding)
		{
			px = (px + 0.5) | 0;
			py = (py + 0.5) | 0;
		}
		this.rotateViewport(px, py, null);
		var myscale = this.getScale();
		glw.resetModelView();
		glw.scale(myscale, myscale);
		glw.rotateZ(-this.getAngle());
		glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
		glw.updateModelView();
		var i, len, inst, bbox;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			if (!inst.visible || inst.width === 0 || inst.height === 0)
				continue;
			inst.update_bbox();
			bbox = inst.bbox;
			if (bbox.right < this.viewLeft || bbox.bottom < this.viewTop || bbox.left > this.viewRight || bbox.top > this.viewBottom)
				continue;
			if (inst.uses_shaders)
			{
				shaderindex = inst.active_effect_types[0].shaderindex;
				etindex = inst.active_effect_types[0].index;
				if (inst.active_effect_types.length === 1 && !glw.programUsesCrossSampling(shaderindex) &&
					!glw.programExtendsBox(shaderindex) && ((!inst.angle && !inst.layer.getAngle()) || !glw.programUsesDest(shaderindex)) &&
					inst.opacity === 1 && !inst.type.plugin.must_predraw)
				{
					glw.switchProgram(shaderindex);
					glw.setBlend(inst.srcBlend, inst.destBlend);
					if (glw.programIsAnimated(shaderindex))
						this.runtime.redraw = true;
					var destStartX = 0, destStartY = 0, destEndX = 0, destEndY = 0;
					if (glw.programUsesDest(shaderindex))
					{
						var bbox = inst.bbox;
						var screenleft = this.layerToCanvas(bbox.left, bbox.top, true);
						var screentop = this.layerToCanvas(bbox.left, bbox.top, false);
						var screenright = this.layerToCanvas(bbox.right, bbox.bottom, true);
						var screenbottom = this.layerToCanvas(bbox.right, bbox.bottom, false);
						destStartX = screenleft / windowWidth;
						destStartY = 1 - screentop / windowHeight;
						destEndX = screenright / windowWidth;
						destEndY = 1 - screenbottom / windowHeight;
					}
					glw.setProgramParameters(this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget(), // backTex
											 1.0 / inst.width,			// pixelWidth
											 1.0 / inst.height,			// pixelHeight
											 destStartX, destStartY,
											 destEndX, destEndY,
											 this.getScale(),
											 inst.effect_params[etindex]);
					inst.drawGL(glw);
				}
				else
				{
					this.layout.renderEffectChain(glw, this, inst, this.render_offscreen ? this.runtime.layer_tex : this.layout.getRenderTarget());
					glw.resetModelView();
					glw.scale(myscale, myscale);
					glw.rotateZ(-this.getAngle());
					glw.translate((this.viewLeft + this.viewRight) / -2, (this.viewTop + this.viewBottom) / -2);
					glw.updateModelView();
				}
			}
			else
			{
				glw.switchProgram(0);		// un-set any previously set shader
				glw.setBlend(inst.srcBlend, inst.destBlend);
				inst.drawGL(glw);
			}
		}
		if (this.render_offscreen)
		{
			shaderindex = this.active_effect_types.length ? this.active_effect_types[0].shaderindex : 0;
			etindex = this.active_effect_types.length ? this.active_effect_types[0].index : 0;
			if (this.active_effect_types.length === 0 || (this.active_effect_types.length === 1 &&
				!glw.programUsesCrossSampling(shaderindex) && this.opacity === 1))
			{
				if (this.active_effect_types.length === 1)
				{
					glw.switchProgram(shaderindex);
					glw.setProgramParameters(this.layout.getRenderTarget(),		// backTex
											 1.0 / this.runtime.width,			// pixelWidth
											 1.0 / this.runtime.height,			// pixelHeight
											 0.0, 0.0,							// destStart
											 1.0, 1.0,							// destEnd
											 this.getScale(),					// layerScale
											 this.effect_params[etindex]);		// fx parameters
					if (glw.programIsAnimated(shaderindex))
						this.runtime.redraw = true;
				}
				else
					glw.switchProgram(0);
				glw.setRenderingToTexture(this.layout.getRenderTarget());
				glw.setOpacity(this.opacity);
				glw.setTexture(this.runtime.layer_tex);
				glw.setBlend(this.srcBlend, this.destBlend);
				glw.resetModelView();
				glw.updateModelView();
				var halfw = this.runtime.width / 2;
				var halfh = this.runtime.height / 2;
				glw.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
				glw.setTexture(null);
			}
			else
			{
				this.layout.renderEffectChain(glw, this, null, this.layout.getRenderTarget());
			}
		}
	};
	Layer.prototype.canvasToLayer = function (ptx, pty, getx)
	{
		var multiplier = this.runtime.devicePixelRatio;
		if (this.runtime.isRetina && this.runtime.fullscreen_mode > 0)
		{
			ptx *= multiplier;
			pty *= multiplier;
		}
		var ox = (this.runtime.original_width / 2);
		var oy = (this.runtime.original_height / 2);
		var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
		var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
		var invScale = 1 / this.getScale();
		x -= (this.runtime.width * invScale) / 2;
		y -= (this.runtime.height * invScale) / 2;
		x += ptx * invScale;
		y += pty * invScale;
		var a = this.getAngle();
		if (a !== 0)
		{
			x -= this.layout.scrollX;
			y -= this.layout.scrollY;
			var cosa = Math.cos(a);
			var sina = Math.sin(a);
			var x_temp = (x * cosa) - (y * sina);
			y = (y * cosa) + (x * sina);
			x = x_temp;
			x += this.layout.scrollX;
			y += this.layout.scrollY;
		}
		return getx ? x : y;
	};
	Layer.prototype.layerToCanvas = function (ptx, pty, getx)
	{
		var a = this.getAngle();
		if (a !== 0)
		{
			ptx -= this.layout.scrollX;
			pty -= this.layout.scrollY;
			var cosa = Math.cos(-a);
			var sina = Math.sin(-a);
			var x_temp = (ptx * cosa) - (pty * sina);
			pty = (pty * cosa) + (ptx * sina);
			ptx = x_temp;
			ptx += this.layout.scrollX;
			pty += this.layout.scrollY;
		}
		var ox = (this.runtime.original_width / 2);
		var oy = (this.runtime.original_height / 2);
		var x = ((this.layout.scrollX - ox) * this.parallaxX) + ox;
		var y = ((this.layout.scrollY - oy) * this.parallaxY) + oy;
		var invScale = 1 / this.getScale();
		x -= (this.runtime.width * invScale) / 2;
		y -= (this.runtime.height * invScale) / 2;
		x = (ptx - x) / invScale;
		y = (pty - y) / invScale;
		var multiplier = this.runtime.devicePixelRatio;
		if (this.runtime.isRetina && this.runtime.fullscreen_mode > 0)
		{
			x /= multiplier;
			y /= multiplier;
		}
		return getx ? x : y;
	};
	Layer.prototype.rotatePt = function (x_, y_, getx)
	{
		if (this.getAngle() === 0)
			return getx ? x_ : y_;
		var nx = this.layerToCanvas(x_, y_, true);
		var ny = this.layerToCanvas(x_, y_, false);
		this.disableAngle = true;
		var px = this.canvasToLayer(nx, ny, true);
		var py = this.canvasToLayer(nx, ny, true);
		this.disableAngle = false;
		return getx ? px : py;
	};
	Layer.prototype.saveToJSON = function ()
	{
		var i, len, et;
		var o = {
			"s": this.scale,
			"a": this.angle,
			"vl": this.viewLeft,
			"vt": this.viewTop,
			"vr": this.viewRight,
			"vb": this.viewBottom,
			"v": this.visible,
			"bc": this.background_color,
			"t": this.transparent,
			"px": this.parallaxX,
			"py": this.parallaxY,
			"o": this.opacity,
			"zr": this.zoomRate,
			"fx": [],
			"instances": []
		};
		for (i = 0, len = this.effect_types.length; i < len; i++)
		{
			et = this.effect_types[i];
			o["fx"].push({"name": et.name, "active": et.active, "params": this.effect_params[et.index] });
		}
		return o;
	};
	function sortInstanceByZIndex(a, b)
	{
		return a.zindex - b.zindex;
	};
	Layer.prototype.loadFromJSON = function (o)
	{
		var i, len, p, inst, fx;
		this.scale = o["s"];
		this.angle = o["a"];
		this.viewLeft = o["vl"];
		this.viewTop = o["vt"];
		this.viewRight = o["vr"];
		this.viewBottom = o["vb"];
		this.visible = o["v"];
		this.background_color = o["bc"];
		this.transparent = o["t"];
		this.parallaxX = o["px"];
		this.parallaxY = o["py"];
		this.opacity = o["o"];
		this.zoomRate = o["zr"];
		var ofx = o["fx"];
		for (i = 0, len = ofx.length; i < len; i++)
		{
			fx = this.getEffectByName(ofx[i]["name"]);
			if (!fx)
				continue;		// must've gone missing
			fx.active = ofx[i]["active"];
			this.effect_params[fx.index] = ofx[i]["params"];
		}
		this.updateActiveEffects();
		this.instances.sort(sortInstanceByZIndex);
		this.zindices_stale = true;
	};
	cr.layer = Layer;
}());
;
(function()
{
	var allUniqueSolModifiers = [];
	function testSolsMatch(arr1, arr2)
	{
		var i, len = arr1.length;
		switch (len) {
		case 0:
			return true;
		case 1:
			return arr1[0] === arr2[0];
		case 2:
			return arr1[0] === arr2[0] && arr1[1] === arr2[1];
		default:
			for (i = 0; i < len; i++)
			{
				if (arr1[i] !== arr2[i])
					return false;
			}
			return true;
		}
	};
	function solArraySorter(t1, t2)
	{
		return t1.index - t2.index;
	};
	function findMatchingSolModifier(arr)
	{
		var i, len, u, temp, subarr;
		if (arr.length === 2)
		{
			if (arr[0].index > arr[1].index)
			{
				temp = arr[0];
				arr[0] = arr[1];
				arr[1] = temp;
			}
		}
		else if (arr.length > 2)
			arr.sort(solArraySorter);		// so testSolsMatch compares in same order
		if (arr.length >= allUniqueSolModifiers.length)
			allUniqueSolModifiers.length = arr.length + 1;
		if (!allUniqueSolModifiers[arr.length])
			allUniqueSolModifiers[arr.length] = [];
		subarr = allUniqueSolModifiers[arr.length];
		for (i = 0, len = subarr.length; i < len; i++)
		{
			u = subarr[i];
			if (testSolsMatch(arr, u))
				return u;
		}
		subarr.push(arr);
		return arr;
	};
	function EventSheet(runtime, m)
	{
		this.runtime = runtime;
		this.triggers = {};
		this.fasttriggers = {};
        this.hasRun = false;
        this.includes = new cr.ObjectSet(); // all event sheets included by this sheet, at first-level indirection only
		this.name = m[0];
		var em = m[1];		// events model
		this.events = [];       // triggers won't make it to this array
		var i, len;
		for (i = 0, len = em.length; i < len; i++)
			this.init_event(em[i], null, this.events);
	};
    EventSheet.prototype.toString = function ()
    {
        return this.name;
    };
	EventSheet.prototype.init_event = function (m, parent, nontriggers)
	{
		switch (m[0]) {
		case 0:	// event block
		{
			var block = new cr.eventblock(this, parent, m);
			cr.seal(block);
			if (block.orblock)
			{
				nontriggers.push(block);
				var i, len;
				for (i = 0, len = block.conditions.length; i < len; i++)
				{
					if (block.conditions[i].trigger)
						this.init_trigger(block, i);
				}
			}
			else
			{
				if (block.is_trigger())
					this.init_trigger(block, 0);
				else
					nontriggers.push(block);
			}
			break;
		}
		case 1: // variable
		{
			var v = new cr.eventvariable(this, parent, m);
			cr.seal(v);
			nontriggers.push(v);
			break;
		}
        case 2:	// include
        {
            var inc = new cr.eventinclude(this, parent, m);
			cr.seal(inc);
            nontriggers.push(inc);
			break;
        }
		default:
;
		}
	};
	EventSheet.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++)
		{
			this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block);
		}
	};
	EventSheet.prototype.run = function ()
	{
        this.hasRun = true;
		this.runtime.isRunningEvents = true;
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++)
		{
			var ev = this.events[i];
			ev.run();
			this.runtime.clearSol(ev.solModifiers);
			if (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length)
				this.runtime.ClearDeathRow();
		}
		this.runtime.isRunningEvents = false;
	};
	EventSheet.prototype.init_trigger = function (trig, index)
	{
		if (!trig.orblock)
			this.runtime.triggers_to_postinit.push(trig);	// needs to be postInit'd later
		var i, len;
		var cnd = trig.conditions[index];
		var type_name;
		if (cnd.type)
			type_name = cnd.type.name;
		else
			type_name = "system";
		var fasttrigger = cnd.fasttrigger;
		var triggers = (fasttrigger ? this.fasttriggers : this.triggers);
		if (!triggers[type_name])
			triggers[type_name] = [];
		var obj_entry = triggers[type_name];
		var method = cnd.func;
		if (fasttrigger)
		{
			if (!cnd.parameters.length)				// no parameters
				return;
			var firstparam = cnd.parameters[0];
			if (firstparam.type !== 1 ||			// not a string param
				firstparam.expression.type !== 2)	// not a string literal node
			{
				return;
			}
			var fastevs;
			var firstvalue = firstparam.expression.value.toLowerCase();
			var i, len;
			for (i = 0, len = obj_entry.length; i < len; i++)
			{
				if (obj_entry[i].method == method)
				{
					fastevs = obj_entry[i].evs;
					if (!fastevs[firstvalue])
						fastevs[firstvalue] = [[trig, index]];
					else
						fastevs[firstvalue].push([trig, index]);
					return;
				}
			}
			fastevs = {};
			fastevs[firstvalue] = [[trig, index]];
			obj_entry.push({ method: method, evs: fastevs });
		}
		else
		{
			for (i = 0, len = obj_entry.length; i < len; i++)
			{
				if (obj_entry[i].method == method)
				{
					obj_entry[i].evs.push([trig, index]);
					return;
				}
			}
			obj_entry.push({ method: method, evs: [[trig, index]]});
		}
	};
	cr.eventsheet = EventSheet;
	function Selection(type)
	{
		this.type = type;
		this.instances = [];        // subset of picked instances
		this.else_instances = [];	// subset of unpicked instances
		this.select_all = true;
	};
	Selection.prototype.hasObjects = function ()
	{
		if (this.select_all)
			return this.type.instances.length;
		else
			return this.instances.length;
	};
	Selection.prototype.getObjects = function ()
	{
		if (this.select_all)
			return this.type.instances;
		else
			return this.instances;
	};
	/*
	Selection.prototype.ensure_picked = function (inst, skip_siblings)
	{
		var i, len;
		var orblock = inst.runtime.getCurrentEventStack().current_event.orblock;
		if (this.select_all)
		{
			this.select_all = false;
			if (orblock)
			{
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				cr.arrayFindRemove(this.else_instances, inst);
			}
			this.instances.length = 1;
			this.instances[0] = inst;
		}
		else
		{
			if (orblock)
			{
				i = this.else_instances.indexOf(inst);
				if (i !== -1)
				{
					this.instances.push(this.else_instances[i]);
					this.else_instances.splice(i, 1);
				}
			}
			else
			{
				if (this.instances.indexOf(inst) === -1)
					this.instances.push(inst);
			}
		}
		if (!skip_siblings)
		{
		}
	};
	*/
	Selection.prototype.pick_one = function (inst)
	{
		if (!inst)
			return;
		if (inst.runtime.getCurrentEventStack().current_event.orblock)
		{
			if (this.select_all)
			{
				this.instances.length = 0;
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				this.select_all = false;
			}
			var i = this.else_instances.indexOf(inst);
			if (i !== -1)
			{
				this.instances.push(this.else_instances[i]);
				this.else_instances.splice(i, 1);
			}
		}
		else
		{
			this.select_all = false;
			this.instances.length = 1;
			this.instances[0] = inst;
		}
	};
	cr.selection = Selection;
	function EventBlock(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.solModifiersIncludingParents = [];
		this.solWriterAfterCnds = false;	// block does not change SOL after running its conditions
		this.group = false;					// is group of events
		this.initially_activated = false;	// if a group, is active on startup
		this.toplevelevent = false;			// is an event block parented only by a top-level group
		this.toplevelgroup = false;			// is parented only by other groups or is top-level (i.e. not in a subevent)
		this.has_else_block = false;		// is followed by else
;
		this.conditions = [];
		this.actions = [];
		this.subevents = [];
        if (m[1])
        {
			this.group_name = m[1][1].toLowerCase();
			this.group = true;
			this.initially_activated = !!m[1][0];
			this.runtime.allGroups.push(this);
            this.runtime.activeGroups[(/*this.sheet.name + "|" + */this.group_name).toLowerCase()] = this.initially_activated;
        }
		else
		{
			this.group_name = "";
			this.group = false;
			this.initially_activated = false;
		}
		this.orblock = m[2];
		this.sid = m[3];
		if (!this.group)
			this.runtime.blocksBySid[this.sid.toString()] = this;
		var i, len;
		var cm = m[4];
		for (i = 0, len = cm.length; i < len; i++)
		{
			var cnd = new cr.condition(this, cm[i]);
			cr.seal(cnd);
			this.conditions.push(cnd);
			/*
			if (cnd.is_logical())
				this.is_logical = true;
			if (cnd.type && !cnd.type.plugin.singleglobal && this.cndReferences.indexOf(cnd.type) === -1)
				this.cndReferences.push(cnd.type);
			*/
			this.addSolModifier(cnd.type);
		}
		var am = m[5];
		for (i = 0, len = am.length; i < len; i++)
		{
			var act = new cr.action(this, am[i]);
			cr.seal(act);
			this.actions.push(act);
		}
		if (m.length === 7)
		{
			var em = m[6];
			for (i = 0, len = em.length; i < len; i++)
				this.sheet.init_event(em[i], this, this.subevents);
		}
		this.is_else_block = false;
		if (this.conditions.length)
			this.is_else_block = (this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else);
	};
	EventBlock.prototype.postInit = function (hasElse/*, prevBlock_*/)
	{
		var i, len;
		var p = this.parent;
		if (this.group)
		{
			this.toplevelgroup = true;
			while (p)
			{
				if (!p.group)
				{
					this.toplevelgroup = false;
					break;
				}
				p = p.parent;
			}
		}
		this.toplevelevent = !this.is_trigger() && (!this.parent || (this.parent.group && this.parent.toplevelgroup));
		this.has_else_block = !!hasElse;
		this.solModifiersIncludingParents = this.solModifiers.slice(0);
		p = this.parent;
		while (p)
		{
			for (i = 0, len = p.solModifiers.length; i < len; i++)
				this.addParentSolModifier(p.solModifiers[i]);
			p = p.parent;
		}
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
		var i, len/*, s*/;
		for (i = 0, len = this.conditions.length; i < len; i++)
			this.conditions[i].postInit();
		for (i = 0, len = this.actions.length; i < len; i++)
			this.actions[i].postInit();
		for (i = 0, len = this.subevents.length; i < len; i++)
		{
			this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block);
		}
		/*
		if (this.is_else_block && this.prev_block)
		{
			for (i = 0, len = this.prev_block.solModifiers.length; i < len; i++)
			{
				s = this.prev_block.solModifiers[i];
				if (this.solModifiers.indexOf(s) === -1)
					this.solModifiers.push(s);
			}
		}
		*/
	}
	function addSolModifierToList(type, arr)
	{
		var i, len, t;
		if (!type)
			return;
		if (arr.indexOf(type) === -1)
			arr.push(type);
		if (type.is_contained)
		{
			for (i = 0, len = type.container.length; i < len; i++)
			{
				t = type.container[i];
				if (type === t)
					continue;		// already handled
				if (arr.indexOf(t) === -1)
					arr.push(t);
			}
		}
	};
	EventBlock.prototype.addSolModifier = function (type)
	{
		addSolModifierToList(type, this.solModifiers);
	};
	EventBlock.prototype.addParentSolModifier = function (type)
	{
		addSolModifierToList(type, this.solModifiersIncludingParents);
	};
	EventBlock.prototype.setSolWriterAfterCnds = function ()
	{
		this.solWriterAfterCnds = true;
		if (this.parent)
			this.parent.setSolWriterAfterCnds();
	};
	EventBlock.prototype.is_trigger = function ()
	{
		if (!this.conditions.length)    // no conditions
			return false;
		else
			return this.conditions[0].trigger;
	};
	EventBlock.prototype.run = function ()
	{
		var i, len, any_true = false/*, bail = false*/;
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (!this.is_else_block)
			evinfo.else_branch_ran = false;
		if (this.orblock)
		{
			if (this.conditions.length === 0)
				any_true = true;		// be sure to run if empty block
			for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (this.conditions[evinfo.cndindex].trigger)		// skip triggers when running OR block
					continue;
				if (this.conditions[evinfo.cndindex].run())			// make sure all conditions run and run if any were true
					any_true = true;
			}
			evinfo.last_event_true = any_true;
			if (any_true)
				this.run_actions_and_subevents();
		}
		else
		{
			for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (!this.conditions[evinfo.cndindex].run())    // condition failed
				{
					evinfo.last_event_true = false;
					if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
						this.runtime.ClearDeathRow();
					return;										// bail out now
				}
			}
			evinfo.last_event_true = true;
			this.run_actions_and_subevents();
		}
		if (evinfo.last_event_true && this.has_else_block)
			evinfo.else_branch_ran = true;
		if (this.toplevelevent && (!this.runtime.deathRow.isEmpty() || this.runtime.createRow.length))
			this.runtime.ClearDeathRow();
	};
	EventBlock.prototype.run_orblocktrigger = function (index)
	{
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (this.conditions[index].run())
		{
			this.run_actions_and_subevents();
		}
	};
	EventBlock.prototype.run_actions_and_subevents = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
		{
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.resume_actions_and_subevents = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++)
		{
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.run_subevents = function ()
	{
		if (!this.subevents.length)
			return;
		var i, len, subev, pushpop/*, skipped_pop = false, pop_modifiers = null*/;
		var last = this.subevents.length - 1;
		this.runtime.pushEventStack(this);
		if (this.solWriterAfterCnds)
		{
			for (i = 0, len = this.subevents.length; i < len; i++)
			{
				subev = this.subevents[i];
				pushpop = (!this.toplevelgroup || (!this.group && i < last));
				if (pushpop)
					this.runtime.pushCopySol(subev.solModifiers);
				subev.run();
				if (pushpop)
					this.runtime.popSol(subev.solModifiers);
				else
					this.runtime.clearSol(subev.solModifiers);
			}
		}
		else
		{
			for (i = 0, len = this.subevents.length; i < len; i++)
			{
				this.subevents[i].run();
			}
		}
		this.runtime.popEventStack();
	};
	EventBlock.prototype.run_pretrigger = function ()
	{
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var any_true = false;
		var i, len;
		for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
		{
;
			if (this.conditions[evinfo.cndindex].run())
				any_true = true;
			else if (!this.orblock)			// condition failed (let OR blocks run all conditions anyway)
				return false;               // bail out
		}
		return this.orblock ? any_true : true;
	};
	EventBlock.prototype.retrigger = function ()
	{
		this.runtime.execcount++;
		var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
		var len;
		var evinfo = this.runtime.pushEventStack(this);
		if (!this.orblock)
		{
			for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++)
			{
				if (!this.conditions[evinfo.cndindex].run())    // condition failed
				{
					this.runtime.popEventStack();               // moving up level of recursion
					return false;                               // bail out
				}
			}
		}
		this.run_actions_and_subevents();
		this.runtime.popEventStack();
		return true;		// ran an iteration
	};
	cr.eventblock = EventBlock;
	function Condition(block, m)
	{
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.func = m[1];
;
		this.trigger = (m[3] > 0);
		this.fasttrigger = (m[3] === 2);
		this.looping = m[4];
		this.inverted = m[5];
		this.isstatic = m[6];
		this.sid = m[7];
		this.runtime.cndsBySid[this.sid.toString()] = this;
		if (m[0] === -1)		// system object
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else
		{
			this.type = this.runtime.types_by_index[m[0]];
;
			if (this.isstatic)
				this.run = this.run_static;
			else
				this.run = this.run_object;
			if (m[2])
			{
				this.behaviortype = this.type.getBehaviorByName(m[2]);
;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
			}
			else
			{
				this.behaviortype = null;
				this.beh_index = -1;
			}
			if (this.block.parent)
				this.block.parent.setSolWriterAfterCnds();
		}
		if (this.fasttrigger)
			this.run = this.run_true;
		if (m.length === 9)
		{
			var i, len;
			var em = m[8];
			for (i = 0, len = em.length; i < len; i++)
			{
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Condition.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.parameters[i].postInit();
	};
	/*
	Condition.prototype.is_logical = function ()
	{
		return !this.type || this.type.plugin.singleglobal;
	};
	*/
	Condition.prototype.run_true = function ()
	{
		return true;
	};
	Condition.prototype.run_system = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted);
	};
	Condition.prototype.run_static = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get(i);
		var ret = this.func.apply(this.behaviortype ? this.behaviortype : this.type, this.results);
		this.type.applySolToContainer();
		return ret;
	};
	Condition.prototype.run_object = function ()
	{
		var i, j, leni, lenj, ret, met, inst, s, sol2;
		var sol = this.type.getCurrentSol();
		var is_orblock = this.block.orblock && !this.trigger;		// triggers in OR blocks need to work normally
		var offset = 0;
		var is_contained = this.type.is_contained;
		if (sol.select_all) {
			sol.instances.length = 0;       // clear contents
			sol.else_instances.length = 0;
			for (i = 0, leni = this.type.instances.length; i < leni; i++)
			{
				inst = this.type.instances[i];
;
				for (j = 0, lenj = this.parameters.length; j < lenj; j++)
					this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
				if (this.beh_index > -1)
				{
					if (this.type.is_family)
					{
						offset = inst.type.family_beh_map[this.type.family_index];
					}
					ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
				}
				else
					ret = this.func.apply(inst, this.results);
				met = cr.xor(ret, this.inverted);
				if (met)
					sol.instances.push(inst);
				else if (is_orblock)					// in OR blocks, keep the instances not meeting the condition for subsequent testing
					sol.else_instances.push(inst);
			}
			if (this.type.finish)
				this.type.finish(true);
			sol.select_all = false;
			this.type.applySolToContainer();
			return sol.hasObjects();
		}
		else {
			var k = 0;
			var using_else_instances = (is_orblock && this.runtime.getCurrentEventStack().cndindex > 0);
			var arr = (using_else_instances ? sol.else_instances : sol.instances);
			var any_true = false;
			for (i = 0, leni = arr.length; i < leni; i++)
			{
				inst = arr[i];
;
				for (j = 0, lenj = this.parameters.length; j < lenj; j++)
					this.results[j] = this.parameters[j].get(i);        // default SOL index is current object
				if (this.beh_index > -1)
				{
					if (this.type.is_family)
					{
						offset = inst.type.family_beh_map[this.type.family_index];
					}
					ret = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
				}
				else
					ret = this.func.apply(inst, this.results);
				if (cr.xor(ret, this.inverted))
				{
					any_true = true;
					if (using_else_instances)
					{
						sol.instances.push(inst);
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().instances.push(s);
							}
						}
					}
					else
					{
						arr[k] = inst;
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().instances[k] = s;
							}
						}
						k++;
					}
				}
				else
				{
					if (using_else_instances)
					{
						arr[k] = inst;
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances[k] = s;
							}
						}
						k++;
					}
					else
					{
						sol.else_instances.push(inst);
						if (is_contained)
						{
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
							{
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances.push(s);
							}
						}
					}
				}
			}
			arr.length = k;
			if (is_contained)
			{
				for (i = 0, leni = this.type.container.length; i < leni; i++)
				{
					sol2 = this.type.container[i].getCurrentSol();
					if (using_else_instances)
						sol2.else_instances.length = k;
					else
						sol2.instances.length = k;
				}
			}
			var pick_in_finish = any_true;		// don't pick in finish() if we're only doing the logic test below
			if (using_else_instances && !any_true)
			{
				for (i = 0, leni = sol.instances.length; i < leni; i++)
				{
					inst = sol.instances[i];
					for (j = 0, lenj = this.parameters.length; j < lenj; j++)
						this.results[j] = this.parameters[j].get(i);
					if (this.beh_index > -1)
						ret = this.func.apply(inst.behavior_insts[this.beh_index], this.results);
					else
						ret = this.func.apply(inst, this.results);
					if (cr.xor(ret, this.inverted))
					{
						any_true = true;
						break;		// got our flag, don't need to test any more
					}
				}
			}
			if (this.type.finish)
				this.type.finish(pick_in_finish || is_orblock);
			return is_orblock ? any_true : sol.hasObjects();
		}
	};
	cr.condition = Condition;
	function Action(block, m)
	{
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.func = m[1];
;
		if (m[0] === -1)	// system
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else
		{
			this.type = this.runtime.types_by_index[m[0]];
;
			this.run = this.run_object;
			if (m[2])
			{
				this.behaviortype = this.type.getBehaviorByName(m[2]);
;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
;
			}
			else
			{
				this.behaviortype = null;
				this.beh_index = -1;
			}
		}
		this.sid = m[3];
		this.runtime.actsBySid[this.sid.toString()] = this;
		if (m.length === 5)
		{
			var i, len;
			var em = m[4];
			for (i = 0, len = em.length; i < len; i++)
			{
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Action.prototype.postInit = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.parameters[i].postInit();
	};
	Action.prototype.run_system = function ()
	{
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return this.func.apply(this.runtime.system, this.results);
	};
	Action.prototype.run_object = function ()
	{
		var instances = this.type.getCurrentSol().getObjects();
		var i, j, leni, lenj, inst;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			inst = instances[i];
			for (j = 0, lenj = this.parameters.length; j < lenj; j++)
				this.results[j] = this.parameters[j].get(i);    // pass i to use as default SOL index
			if (this.beh_index > -1)
			{
				var offset = 0;
				if (this.type.is_family)
				{
					offset = inst.type.family_beh_map[this.type.family_index];
				}
				this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
			}
			else
				this.func.apply(inst, this.results);
		}
		return false;
	};
	cr.action = Action;
	var tempValues = [];
	var tempValuesPtr = -1;
	function Parameter(owner, m)
	{
		this.owner = owner;
		this.block = owner.block;
		this.sheet = owner.sheet;
		this.runtime = owner.runtime;
		this.type = m[0];
		this.expression = null;
		this.solindex = 0;
		this.combosel = 0;
		this.layout = null;
		this.key = 0;
		this.object = null;
		this.index = 0;
		this.varname = null;
		this.eventvar = null;
		this.fileinfo = null;
		this.subparams = null;
		this.variadicret = null;
		var i, len, param;
		switch (m[0])
		{
			case 0:		// number
			case 7:		// any
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp;
				break;
			case 1:		// string
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp_str;
				break;
			case 5:		// layer
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_layer;
				break;
			case 3:		// combo
			case 8:		// cmp
				this.combosel = m[1];
				this.get = this.get_combosel;
				break;
			case 6:		// layout
				this.layout = this.runtime.layouts[m[1]];
;
				this.get = this.get_layout;
				break;
			case 9:		// keyb
				this.key = m[1];
				this.get = this.get_key;
				break;
			case 4:		// object
				this.object = this.runtime.types_by_index[m[1]];
;
				this.get = this.get_object;
				this.block.addSolModifier(this.object);
				if (this.owner instanceof cr.action)
					this.block.setSolWriterAfterCnds();
				else if (this.block.parent)
					this.block.parent.setSolWriterAfterCnds();
				break;
			case 10:	// instvar
				this.index = m[1];
				if (owner.type.is_family)
					this.get = this.get_familyvar;
				else
					this.get = this.get_instvar;
				break;
			case 11:	// eventvar
				this.varname = m[1];
				this.eventvar = null;
				this.get = this.get_eventvar;
				break;
			case 2:		// audiofile	["name", ismusic]
			case 12:	// fileinfo		"name"
				this.fileinfo = m[1];
				this.get = this.get_audiofile;
				break;
			case 13:	// variadic
				this.get = this.get_variadic;
				this.subparams = [];
				this.variadicret = [];
				for (i = 1, len = m.length; i < len; i++)
				{
					param = new cr.parameter(this.owner, m[i]);
					cr.seal(param);
					this.subparams.push(param);
					this.variadicret.push(0);
				}
				break;
			default:
;
		}
	};
	Parameter.prototype.postInit = function ()
	{
		var i, len;
		if (this.type === 11)		// eventvar
		{
			this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent);
;
		}
		else if (this.type === 13)	// variadic, postInit all sub-params
		{
			for (i = 0, len = this.subparams.length; i < len; i++)
				this.subparams[i].postInit();
		}
		if (this.expression)
			this.expression.postInit();
	};
	Parameter.prototype.pushTempValue = function ()
	{
		tempValuesPtr++;
		if (tempValues.length === tempValuesPtr)
			tempValues.push(new cr.expvalue());
		return tempValues[tempValuesPtr];
	};
	Parameter.prototype.popTempValue = function ()
	{
		tempValuesPtr--;
	};
	Parameter.prototype.get_exp = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		return temp.data;      			// return actual JS value, not expvalue
	};
	Parameter.prototype.get_exp_str = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		if (cr.is_string(temp.data))
			return temp.data;
		else
			return "";
	};
	Parameter.prototype.get_object = function ()
	{
		return this.object;
	};
	Parameter.prototype.get_combosel = function ()
	{
		return this.combosel;
	};
	Parameter.prototype.get_layer = function (solindex)
	{
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = this.pushTempValue();
		this.expression.get(temp);
		this.popTempValue();
		if (temp.is_number())
			return this.runtime.getLayerByNumber(temp.data);
		else
			return this.runtime.getLayerByName(temp.data);
	}
	Parameter.prototype.get_layout = function ()
	{
		return this.layout;
	};
	Parameter.prototype.get_key = function ()
	{
		return this.key;
	};
	Parameter.prototype.get_instvar = function ()
	{
		return this.index;
	};
	Parameter.prototype.get_familyvar = function (solindex)
	{
		var familytype = this.owner.type;
		var realtype = null;
		var sol = familytype.getCurrentSol();
		var objs = sol.getObjects();
		if (objs.length)
			realtype = objs[solindex % objs.length].type;
		else
		{
;
			realtype = sol.else_instances[solindex % sol.else_instances.length].type;
		}
		return this.index + realtype.family_var_map[familytype.family_index];
	};
	Parameter.prototype.get_eventvar = function ()
	{
		return this.eventvar;
	};
	Parameter.prototype.get_audiofile = function ()
	{
		return this.fileinfo;
	};
	Parameter.prototype.get_variadic = function ()
	{
		var i, len;
		for (i = 0, len = this.subparams.length; i < len; i++)
		{
			this.variadicret[i] = this.subparams[i].get();
		}
		return this.variadicret;
	};
	cr.parameter = Parameter;
	function EventVariable(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.name = m[1];
		this.vartype = m[2];
		this.initial = m[3];
		this.is_static = !!m[4];
		this.is_constant = !!m[5];
		this.sid = m[6];
		this.runtime.varsBySid[this.sid.toString()] = this;
		this.data = this.initial;	// note: also stored in event stack frame for local nonstatic nonconst vars
		if (this.parent)			// local var
		{
			if (this.is_static || this.is_constant)
				this.localIndex = -1;
			else
				this.localIndex = this.runtime.stackLocalCount++;
			this.runtime.all_local_vars.push(this);
		}
		else						// global var
		{
			this.localIndex = -1;
			this.runtime.all_global_vars.push(this);
		}
	};
	EventVariable.prototype.postInit = function ()
	{
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventVariable.prototype.setValue = function (x)
	{
;
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs)
			this.data = x;
		else	// local nonstatic variable: use event stack to keep value at this level of recursion
		{
			if (this.localIndex >= lvs.length)
				lvs.length = this.localIndex + 1;
			lvs[this.localIndex] = x;
		}
	};
	EventVariable.prototype.getValue = function ()
	{
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs || this.is_constant)
			return this.data;
		else	// local nonstatic variable
		{
			if (this.localIndex >= lvs.length)
			{
;
				return this.initial;
			}
			if (typeof lvs[this.localIndex] === "undefined")
			{
;
				return this.initial;
			}
			return lvs[this.localIndex];
		}
	};
	EventVariable.prototype.run = function ()
	{
		if (this.parent && !this.is_static && !this.is_constant)
			this.setValue(this.initial);
	};
	cr.eventvariable = EventVariable;
	function EventInclude(sheet, parent, m)
	{
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.include_sheet = null;		// determined in postInit
		this.include_sheet_name = m[1];
	};
	EventInclude.prototype.toString = function ()
	{
		return "include:" + this.include_sheet.toString();
	};
	EventInclude.prototype.postInit = function ()
	{
        this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
;
;
        this.sheet.includes.add(this);
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventInclude.prototype.run = function ()
	{
		if (this.parent)
			this.runtime.pushCleanSol(this.runtime.types_by_index);
        if (!this.include_sheet.hasRun)
            this.include_sheet.run();
        if (this.parent)
            this.runtime.popSol(this.runtime.types_by_index);
	};
	EventInclude.prototype.isActive = function ()
	{
		var p = this.parent;
		while (p)
		{
			if (p.group)
			{
				if (!this.runtime.activeGroups[p.group_name.toLowerCase()])
					return false;
			}
			p = p.parent;
		}
		return true;
	};
	cr.eventinclude = EventInclude;
	function EventStackFrame()
	{
		this.temp_parents_arr = [];
		this.reset(null);
		cr.seal(this);
	};
	EventStackFrame.prototype.reset = function (cur_event)
	{
		this.current_event = cur_event;
		this.cndindex = 0;
		this.actindex = 0;
		this.temp_parents_arr.length = 0;
		this.last_event_true = false;
		this.else_branch_ran = false;
	};
	EventStackFrame.prototype.isModifierAfterCnds = function ()
	{
		if (this.current_event.solWriterAfterCnds)
			return true;
		if (this.cndindex < this.current_event.conditions.length - 1)
			return !!this.current_event.solModifiers.length;
		return false;
	};
	cr.eventStackFrame = EventStackFrame;
}());
(function()
{
	function ExpNode(owner_, m)
	{
		this.owner = owner_;
		this.runtime = owner_.runtime;
		this.type = m[0];
;
		this.get = [this.eval_int,
					this.eval_float,
					this.eval_string,
					this.eval_unaryminus,
					this.eval_add,
					this.eval_subtract,
					this.eval_multiply,
					this.eval_divide,
					this.eval_mod,
					this.eval_power,
					this.eval_and,
					this.eval_or,
					this.eval_equal,
					this.eval_notequal,
					this.eval_less,
					this.eval_lessequal,
					this.eval_greater,
					this.eval_greaterequal,
					this.eval_conditional,
					this.eval_system_exp,
					this.eval_object_behavior_exp,
					this.eval_instvar_exp,
					this.eval_object_behavior_exp,
					this.eval_eventvar_exp][this.type];
		var paramsModel = null;
		this.value = null;
		this.first = null;
		this.second = null;
		this.third = null;
		this.func = null;
		this.results = null;
		this.parameters = null;
		this.object_type = null;
		this.beh_index = -1;
		this.instance_expr = null;
		this.varindex = -1;
		this.behavior_type = null;
		this.varname = null;
		this.eventvar = null;
		this.return_string = false;
		switch (this.type) {
		case 0:		// int
		case 1:		// float
		case 2:		// string
			this.value = m[1];
			break;
		case 3:		// unaryminus
			this.first = new cr.expNode(owner_, m[1]);
			break;
		case 18:	// conditional
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
			this.third = new cr.expNode(owner_, m[3]);
			break;
		case 19:	// system_exp
			this.func = m[1];
;
			this.results = [];
			this.parameters = [];
			if (m.length === 3)
			{
				paramsModel = m[2];
				this.results.length = paramsModel.length + 1;	// must also fit 'ret'
			}
			else
				this.results.length = 1;      // to fit 'ret'
			break;
		case 20:	// object_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.beh_index = -1;
			this.func = m[2];
			this.return_string = m[3];
			if (m[4])
				this.instance_expr = new cr.expNode(owner_, m[4]);
			else
				this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 6)
			{
				paramsModel = m[5];
				this.results.length = paramsModel.length + 1;
			}
			else
				this.results.length = 1;	// to fit 'ret'
			break;
		case 21:		// instvar_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.return_string = m[2];
			if (m[3])
				this.instance_expr = new cr.expNode(owner_, m[3]);
			else
				this.instance_expr = null;
			this.varindex = m[4];
			break;
		case 22:		// behavior_exp
			this.object_type = this.runtime.types_by_index[m[1]];
;
			this.behavior_type = this.object_type.getBehaviorByName(m[2]);
;
			this.beh_index = this.object_type.getBehaviorIndexByName(m[2]);
			this.func = m[3];
			this.return_string = m[4];
			if (m[5])
				this.instance_expr = new cr.expNode(owner_, m[5]);
			else
				this.instance_expr = null;
			this.results = [];
			this.parameters = [];
			if (m.length === 7)
			{
				paramsModel = m[6];
				this.results.length = paramsModel.length + 1;
			}
			else
				this.results.length = 1;	// to fit 'ret'
			break;
		case 23:		// eventvar_exp
			this.varname = m[1];
			this.eventvar = null;	// assigned in postInit
			break;
		}
		if (this.type >= 4 && this.type <= 17)
		{
			this.first = new cr.expNode(owner_, m[1]);
			this.second = new cr.expNode(owner_, m[2]);
		}
		if (paramsModel)
		{
			var i, len;
			for (i = 0, len = paramsModel.length; i < len; i++)
				this.parameters.push(new cr.expNode(owner_, paramsModel[i]));
		}
		cr.seal(this);
	};
	ExpNode.prototype.postInit = function ()
	{
		if (this.type === 23)	// eventvar_exp
		{
			this.eventvar = this.owner.runtime.getEventVariableByName(this.varname, this.owner.block.parent);
;
		}
		if (this.first)
			this.first.postInit();
		if (this.second)
			this.second.postInit();
		if (this.third)
			this.third.postInit();
		if (this.instance_expr)
			this.instance_expr.postInit();
		if (this.parameters)
		{
			var i, len;
			for (i = 0, len = this.parameters.length; i < len; i++)
				this.parameters[i].postInit();
		}
	};
	ExpNode.prototype.eval_system_exp = function (ret)
	{
		this.results[0] = ret;
		var temp = this.owner.pushTempValue();
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
		{
			this.parameters[i].get(temp);
			this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
		}
		this.owner.popTempValue();
		this.func.apply(this.runtime.system, this.results);
	};
	ExpNode.prototype.eval_object_behavior_exp = function (ret)
	{
		var sol = this.object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length)
		{
			if (sol.else_instances.length)
				instances = sol.else_instances;
			else
			{
				if (this.return_string)
					ret.set_string("");
				else
					ret.set_int(0);
				return;
			}
		}
		this.results[0] = ret;
		ret.object_class = this.object_type;		// so expression can access family type if need be
		var temp = this.owner.pushTempValue();
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			this.parameters[i].get(temp);
			this.results[i + 1] = temp.data;   // passing actual javascript value as argument instead of expvalue
		}
		var index = this.owner.solindex;
		if (this.instance_expr) {
			this.instance_expr.get(temp);
			if (temp.is_number()) {
				index = temp.data;
				instances = this.object_type.instances;    // pick from all instances, not SOL
			}
		}
		this.owner.popTempValue();
		index %= instances.length;      // wraparound
		if (index < 0)
			index += instances.length;
		var returned_val;
		var inst = instances[index];
		if (this.beh_index > -1)
		{
			var offset = 0;
			if (this.object_type.is_family)
			{
				offset = inst.type.family_beh_map[this.object_type.family_index];
			}
			returned_val = this.func.apply(inst.behavior_insts[this.beh_index + offset], this.results);
		}
		else
			returned_val = this.func.apply(inst, this.results);
;
	};
	ExpNode.prototype.eval_instvar_exp = function (ret)
	{
		var sol = this.object_type.getCurrentSol();
		var instances = sol.getObjects();
		if (!instances.length)
		{
			if (sol.else_instances.length)
				instances = sol.else_instances;
			else
			{
				if (this.return_string)
					ret.set_string("");
				else
					ret.set_int(0);
				return;
			}
		}
		var index = this.owner.solindex;
		if (this.instance_expr)
		{
			var temp = this.owner.pushTempValue();
			this.instance_expr.get(temp);
			if (temp.is_number())
			{
				index = temp.data;
				var type_instances = this.object_type.instances;
				index %= type_instances.length;     // wraparound
				if (index < 0)                      // offset
					index += type_instances.length;
				var to_ret = type_instances[index].instance_vars[this.varindex];
				if (cr.is_string(to_ret))
					ret.set_string(to_ret);
				else
					ret.set_float(to_ret);
				this.owner.popTempValue();
				return;         // done
			}
			this.owner.popTempValue();
		}
		index %= instances.length;      // wraparound
		if (index < 0)
			index += instances.length;
		var inst = instances[index];
		var offset = 0;
		if (this.object_type.is_family)
		{
			offset = inst.type.family_var_map[this.object_type.family_index];
		}
		var to_ret = inst.instance_vars[this.varindex + offset];
		if (cr.is_string(to_ret))
			ret.set_string(to_ret);
		else
			ret.set_float(to_ret);
	};
	ExpNode.prototype.eval_int = function (ret)
	{
		ret.type = cr.exptype.Integer;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_float = function (ret)
	{
		ret.type = cr.exptype.Float;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_string = function (ret)
	{
		ret.type = cr.exptype.String;
		ret.data = this.value;
	};
	ExpNode.prototype.eval_unaryminus = function (ret)
	{
		this.first.get(ret);                // retrieve operand
		if (ret.is_number())
			ret.data = -ret.data;
	};
	ExpNode.prototype.eval_add = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data += temp.data;          // both operands numbers: add
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_subtract = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data -= temp.data;          // both operands numbers: subtract
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_multiply = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data *= temp.data;          // both operands numbers: multiply
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_divide = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data /= temp.data;          // both operands numbers: divide
			ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_mod = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data %= temp.data;          // both operands numbers: modulo
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_power = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			ret.data = Math.pow(ret.data, temp.data);   // both operands numbers: raise to power
			if (temp.is_float())
				ret.make_float();
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_and = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number())
		{
			if (temp.is_string())
			{
				ret.set_string(ret.data.toString() + temp.data);
			}
			else
			{
				if (ret.data && temp.data)
					ret.set_int(1);
				else
					ret.set_int(0);
			}
		}
		else if (ret.is_string())
		{
			if (temp.is_string())
				ret.data += temp.data;
			else
			{
				ret.data += (Math.round(temp.data * 1e10) / 1e10).toString();
			}
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_or = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		if (ret.is_number() && temp.is_number())
		{
			if (ret.data || temp.data)
				ret.set_int(1);
			else
				ret.set_int(0);
		}
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_conditional = function (ret)
	{
		this.first.get(ret);                // condition operand
		if (ret.data)                       // is true
			this.second.get(ret);           // evaluate second operand to ret
		else
			this.third.get(ret);            // evaluate third operand to ret
	};
	ExpNode.prototype.eval_equal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data === temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_notequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data !== temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_less = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data < temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_lessequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data <= temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_greater = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data > temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_greaterequal = function (ret)
	{
		this.first.get(ret);                // left operand
		var temp = this.owner.pushTempValue();
		this.second.get(temp);			// right operand
		ret.set_int(ret.data >= temp.data ? 1 : 0);
		this.owner.popTempValue();
	};
	ExpNode.prototype.eval_eventvar_exp = function (ret)
	{
		var val = this.eventvar.getValue();
		if (cr.is_number(val))
			ret.set_float(val);
		else
			ret.set_string(val);
	};
	cr.expNode = ExpNode;
	function ExpValue(type, data)
	{
		this.type = type || cr.exptype.Integer;
		this.data = data || 0;
		this.object_class = null;
;
;
;
		if (this.type == cr.exptype.Integer)
			this.data = Math.floor(this.data);
		cr.seal(this);
	};
	ExpValue.prototype.is_int = function ()
	{
		return this.type === cr.exptype.Integer;
	};
	ExpValue.prototype.is_float = function ()
	{
		return this.type === cr.exptype.Float;
	};
	ExpValue.prototype.is_number = function ()
	{
		return this.type === cr.exptype.Integer || this.type === cr.exptype.Float;
	};
	ExpValue.prototype.is_string = function ()
	{
		return this.type === cr.exptype.String;
	};
	ExpValue.prototype.make_int = function ()
	{
		if (!this.is_int())
		{
			if (this.is_float())
				this.data = Math.floor(this.data);      // truncate float
			else if (this.is_string())
				this.data = parseInt(this.data, 10);
			this.type = cr.exptype.Integer;
		}
	};
	ExpValue.prototype.make_float = function ()
	{
		if (!this.is_float())
		{
			if (this.is_string())
				this.data = parseFloat(this.data);
			this.type = cr.exptype.Float;
		}
	};
	ExpValue.prototype.make_string = function ()
	{
		if (!this.is_string())
		{
			this.data = this.data.toString();
			this.type = cr.exptype.String;
		}
	};
	ExpValue.prototype.set_int = function (val)
	{
;
		this.type = cr.exptype.Integer;
		this.data = Math.floor(val);
	};
	ExpValue.prototype.set_float = function (val)
	{
;
		this.type = cr.exptype.Float;
		this.data = val;
	};
	ExpValue.prototype.set_string = function (val)
	{
;
		this.type = cr.exptype.String;
		this.data = val;
	};
	ExpValue.prototype.set_any = function (val)
	{
		if (cr.is_number(val))
		{
			this.type = cr.exptype.Float;
			this.data = val;
		}
		else if (cr.is_string(val))
		{
			this.type = cr.exptype.String;
			this.data = val.toString();
		}
		else
		{
			this.type = cr.exptype.Integer;
			this.data = 0;
		}
	};
	cr.expvalue = ExpValue;
	cr.exptype = {
		Integer: 0,     // emulated; no native integer support in javascript
		Float: 1,
		String: 2
	};
}());
;
cr.system_object = function (runtime)
{
    this.runtime = runtime;
	this.waits = [];
};
cr.system_object.prototype.saveToJSON = function ()
{
	var o = {};
	var i, len, j, lenj, p, w, t, sobj;
	o["waits"] = [];
	var owaits = o["waits"];
	var waitobj;
	for (i = 0, len = this.waits.length; i < len; i++)
	{
		w = this.waits[i];
		waitobj = {
			"t": w.time,
			"ev": w.ev.sid,
			"sm": [],
			"sols": {}
		};
		if (w.ev.actions[w.actindex])
			waitobj["act"] = w.ev.actions[w.actindex].sid;
		for (j = 0, lenj = w.solModifiers.length; j < lenj; j++)
			waitobj["sm"].push(w.solModifiers[j].sid);
		for (p in w.sols)
		{
			if (w.sols.hasOwnProperty(p))
			{
				t = this.runtime.types_by_index[parseInt(p, 10)];
;
				sobj = {
					"sa": w.sols[p].sa,
					"insts": []
				};
				for (j = 0, lenj = w.sols[p].insts.length; j < lenj; j++)
					sobj["insts"].push(w.sols[p].insts[j].uid);
				waitobj["sols"][t.sid.toString()] = sobj;
			}
		}
		owaits.push(waitobj);
	}
	return o;
};
cr.system_object.prototype.loadFromJSON = function (o)
{
	var owaits = o["waits"];
	var i, len, j, lenj, p, w, addWait, e, aindex, t, savedsol, nusol, inst;
	this.waits.length = 0;
	for (i = 0, len = owaits.length; i < len; i++)
	{
		w = owaits[i];
		e = this.runtime.blocksBySid[w["ev"].toString()];
		if (!e)
			continue;	// event must've gone missing
		aindex = -1;
		for (j = 0, lenj = e.actions.length; j < lenj; j++)
		{
			if (e.actions[j].sid === w["act"])
			{
				aindex = j;
				break;
			}
		}
		if (aindex === -1)
			continue;	// action must've gone missing
		addWait = {};
		addWait.sols = {};
		addWait.solModifiers = [];
		addWait.deleteme = false;
		addWait.time = w["t"];
		addWait.ev = e;
		addWait.actindex = aindex;
		for (j = 0, lenj = w["sm"].length; j < lenj; j++)
		{
			t = this.runtime.getObjectTypeBySid(w["sm"][j]);
			if (t)
				addWait.solModifiers.push(t);
		}
		for (p in w["sols"])
		{
			if (w["sols"].hasOwnProperty(p))
			{
				t = this.runtime.getObjectTypeBySid(parseInt(p, 10));
				if (!t)
					continue;		// type must've been deleted
				savedsol = w["sols"][p];
				nusol = {
					sa: savedsol["sa"],
					insts: []
				};
				for (j = 0, lenj = savedsol["insts"].length; j < lenj; j++)
				{
					inst = this.runtime.getObjectByUID(savedsol["insts"][j]);
					if (inst)
						nusol.insts.push(inst);
				}
				addWait.sols[t.index.toString()] = nusol;
			}
		}
		this.waits.push(addWait);
	}
};
(function ()
{
	var sysProto = cr.system_object.prototype;
	function SysCnds() {};
    SysCnds.prototype.EveryTick = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutStart = function()
    {
        return true;
    };
    SysCnds.prototype.OnLayoutEnd = function()
    {
        return true;
    };
    SysCnds.prototype.Compare = function(x, cmp, y)
    {
        return cr.do_cmp(x, cmp, y);
    };
    SysCnds.prototype.CompareTime = function (cmp, t)
    {
        var elapsed = this.runtime.kahanTime.sum;
        if (cmp === 0)
        {
            var cnd = this.runtime.getCurrentCondition();
            if (!cnd.extra.CompareTime_executed)
            {
                if (elapsed >= t)
                {
                    cnd.extra.CompareTime_executed = true;
                    return true;
                }
            }
            return false;
        }
        return cr.do_cmp(elapsed, cmp, t);
    };
    SysCnds.prototype.LayerVisible = function (layer)
    {
        if (!layer)
            return false;
        else
            return layer.visible;
    };
	SysCnds.prototype.LayerCmpOpacity = function (layer, cmp, opacity_)
	{
		if (!layer)
			return false;
		return cr.do_cmp(layer.opacity * 100, cmp, opacity_);
	};
    SysCnds.prototype.Repeat = function (count)
    {
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
		if (solModifierAfterCnds)
		{
			for (i = 0; i < count && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = 0; i < count && !current_loop.stopped; i++)
			{
				current_loop.index = i;
				current_event.retrigger();
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
	SysCnds.prototype.While = function (count)
    {
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i;
		if (solModifierAfterCnds)
		{
			for (i = 0; !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				if (!current_event.retrigger())		// one of the other conditions returned false
					current_loop.stopped = true;	// break
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			for (i = 0; !current_loop.stopped; i++)
			{
				current_loop.index = i;
				if (!current_event.retrigger())
					current_loop.stopped = true;
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
    SysCnds.prototype.For = function (name, start, end)
    {
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack(name);
        var i;
		if (end < start)
		{
			if (solModifierAfterCnds)
			{
				for (i = start; i >= end && !current_loop.stopped; --i)  // inclusive to end
				{
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers);
				}
			}
			else
			{
				for (i = start; i >= end && !current_loop.stopped; --i)  // inclusive to end
				{
					current_loop.index = i;
					current_event.retrigger();
				}
			}
		}
		else
		{
			if (solModifierAfterCnds)
			{
				for (i = start; i <= end && !current_loop.stopped; ++i)  // inclusive to end
				{
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers);
				}
			}
			else
			{
				for (i = start; i <= end && !current_loop.stopped; ++i)  // inclusive to end
				{
					current_loop.index = i;
					current_event.retrigger();
				}
			}
		}
        this.runtime.popLoopStack();
		return false;
    };
	var foreach_instancestack = [];
	var foreach_instanceptr = -1;
    SysCnds.prototype.ForEach = function (obj)
    {
        var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
        var i, len, j, lenj, inst, s, sol2;
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds)
		{
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			sol.select_all = false;
			sol.instances.length = 1;
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		instances.length = 0;
        this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
    };
	function foreach_sortinstances(a, b)
	{
		var va = a.extra.c2_foreachordered_val;
		var vb = b.extra.c2_foreachordered_val;
		if (cr.is_number(va) && cr.is_number(vb))
			return va - vb;
		else
		{
			va = "" + va;
			vb = "" + vb;
			if (va < vb)
				return -1;
			else if (va > vb)
				return 1;
			else
				return 0;
		}
	};
	SysCnds.prototype.ForEachOrdered = function (obj, exp, order)
    {
        var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
        var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var current_condition = this.runtime.getCurrentCondition();
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
        var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		for (i = 0, len = instances.length; i < len; i++)
		{
			instances[i].extra.c2_foreachordered_val = current_condition.parameters[1].get(i);
		}
		instances.sort(foreach_sortinstances);
		if (order === 1)
			instances.reverse();
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds)
		{
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else
		{
			sol.select_all = false;
			sol.instances.length = 1;
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++)
			{
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained)
				{
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++)
					{
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						sol2.instances.length = 1;
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		instances.length = 0;
        this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
    };
	SysCnds.prototype.PickByComparison = function (obj_, exp_, cmp_, val_)
	{
		var i, len, k, inst;
		if (!obj_)
			return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all)
			sol.else_instances.length = 0;
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++)
		{
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			val_ = current_condition.parameters[3].get(i);
			if (cr.do_cmp(exp_, cmp_, val_))
			{
				k++;
			}
			else
			{
				sol.else_instances.push(inst);
			}
		}
		tmp_instances.length = k;
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		tmp_instances.length = 0;
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length;
	};
	SysCnds.prototype.PickByEvaluate = function (obj_, exp_)
	{
		var i, len, k, inst;
		if (!obj_)
			return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all)
			sol.else_instances.length = 0;
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++)
		{
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			if (exp_)
			{
				k++;
			}
			else
			{
				sol.else_instances.push(inst);
			}
		}
		tmp_instances.length = k;
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		tmp_instances.length = 0;
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length;
	};
    SysCnds.prototype.TriggerOnce = function ()
    {
        var cndextra = this.runtime.getCurrentCondition().extra;
		if (typeof cndextra.TriggerOnce_lastTick === "undefined")
			cndextra.TriggerOnce_lastTick = -1;
        var last_tick = cndextra.TriggerOnce_lastTick;
        var cur_tick = this.runtime.tickcount;
        cndextra.TriggerOnce_lastTick = cur_tick;
        return this.runtime.layout_first_tick || last_tick !== cur_tick - 1;
    };
    SysCnds.prototype.Every = function (seconds)
    {
        var cnd = this.runtime.getCurrentCondition();
        var last_time = cnd.extra.Every_lastTime || 0;
        var cur_time = this.runtime.kahanTime.sum;
		if (typeof cnd.extra.Every_seconds === "undefined")
			cnd.extra.Every_seconds = seconds;
		var this_seconds = cnd.extra.Every_seconds;
        if (cur_time >= last_time + this_seconds)
        {
            cnd.extra.Every_lastTime = last_time + this_seconds;
			if (cur_time >= cnd.extra.Every_lastTime + this_seconds)
				cnd.extra.Every_lastTime = cur_time;
			cnd.extra.Every_seconds = seconds;
            return true;
        }
        else
            return false;
    };
    SysCnds.prototype.PickNth = function (obj, index)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
		index = cr.floor(index);
        if (index < 0 || index >= instances.length)
            return false;
		var inst = instances[index];
        sol.pick_one(inst);
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.PickRandom = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
		var index = cr.floor(Math.random() * instances.length);
        if (index >= instances.length)
            return false;
		var inst = instances[index];
        sol.pick_one(inst);
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.CompareVar = function (v, cmp, val)
    {
        return cr.do_cmp(v.getValue(), cmp, val);
    };
    SysCnds.prototype.IsGroupActive = function (group)
    {
        return this.runtime.activeGroups[(/*this.runtime.getCurrentCondition().sheet.name + "|" + */group).toLowerCase()];
    };
	SysCnds.prototype.IsPreview = function ()
	{
		return typeof cr_is_preview !== "undefined";
	};
	SysCnds.prototype.PickAll = function (obj)
    {
        if (!obj)
            return false;
		if (!obj.instances.length)
			return false;
        var sol = obj.getCurrentSol();
        sol.select_all = true;
		obj.applySolToContainer();
        return true;
    };
	SysCnds.prototype.IsMobile = function ()
	{
		return this.runtime.isMobile;
	};
	SysCnds.prototype.CompareBetween = function (x, a, b)
	{
		return x >= a && x <= b;
	};
	SysCnds.prototype.Else = function ()
	{
		var current_frame = this.runtime.getCurrentEventStack();
		if (current_frame.else_branch_ran)
			return false;		// another event in this else-if chain has run
		else
			return !current_frame.last_event_true;
		/*
		var current_frame = this.runtime.getCurrentEventStack();
        var current_event = current_frame.current_event;
		var prev_event = current_event.prev_block;
		if (!prev_event)
			return false;
		if (prev_event.is_logical)
			return !this.runtime.last_event_true;
		var i, len, j, lenj, s, sol, temp, inst, any_picked = false;
		for (i = 0, len = prev_event.cndReferences.length; i < len; i++)
		{
			s = prev_event.cndReferences[i];
			sol = s.getCurrentSol();
			if (sol.select_all || sol.instances.length === s.instances.length)
			{
				sol.select_all = false;
				sol.instances.length = 0;
			}
			else
			{
				if (sol.instances.length === 1 && sol.else_instances.length === 0 && s.instances.length >= 2)
				{
					inst = sol.instances[0];
					sol.instances.length = 0;
					for (j = 0, lenj = s.instances.length; j < lenj; j++)
					{
						if (s.instances[j] != inst)
							sol.instances.push(s.instances[j]);
					}
					any_picked = true;
				}
				else
				{
					temp = sol.instances;
					sol.instances = sol.else_instances;
					sol.else_instances = temp;
					any_picked = true;
				}
			}
		}
		return any_picked;
		*/
	};
	SysCnds.prototype.OnLoadFinished = function ()
	{
		return true;
	};
	SysCnds.prototype.OnCanvasSnapshot = function ()
	{
		return true;
	};
	SysCnds.prototype.EffectsSupported = function ()
	{
		return !!this.runtime.glwrap;
	};
	SysCnds.prototype.OnSaveComplete = function ()
	{
		return true;
	};
	SysCnds.prototype.OnLoadComplete = function ()
	{
		return true;
	};
	SysCnds.prototype.OnLoadFailed = function ()
	{
		return true;
	};
	SysCnds.prototype.ObjectUIDExists = function (u)
	{
		return !!this.runtime.getObjectByUID(u);
	};
	SysCnds.prototype.IsOnPlatform = function (p)
	{
		var rt = this.runtime;
		switch (p) {
		case 0:		// HTML5 website
			return !rt.isDomFree && !rt.isNodeWebkit && !rt.isPhoneGap && !rt.isWindows8App && !rt.isWindowsPhone8 && !rt.isBlackberry10;
		case 1:		// iOS
			return rt.isiOS;
		case 2:		// Android
			return rt.isAndroid;
		case 3:		// Windows 8
			return rt.isWindows8App;
		case 4:		// Windows Phone 8
			return rt.isWindowsPhone8;
		case 5:		// Blackberry 10
			return rt.isBlackberry10;
		case 6:		// Tizen
			return rt.isTizen;
		case 7:		// node-webkit
			return rt.isNodeWebkit;
		case 8:		// CocoonJS
			return rt.isCocoonJs;
		case 9:		// PhoneGap
			return rt.isPhoneGap;
		case 10:	// Scirra Arcade
			return rt.isArcade;
		case 11:	// node-webkit
			return rt.isNodeWebkit;
		default:	// should not be possible
			return false;
		}
	};
	var cacheRegex = null;
	var lastRegex = "";
	var lastFlags = "";
	function getRegex(regex_, flags_)
	{
		if (!cacheRegex || regex_ !== lastRegex || flags_ !== lastFlags)
		{
			cacheRegex = new RegExp(regex_, flags_);
			lastRegex = regex_;
			lastFlags = flags_;
		}
		cacheRegex.lastIndex = 0;		// reset
		return cacheRegex;
	};
	SysCnds.prototype.RegexTest = function (str_, regex_, flags_)
	{
		var regex = getRegex(regex_, flags_);
		return regex.test(str_);
	};
	var tmp_arr = [];
	SysCnds.prototype.PickOverlappingPoint = function (obj_, x_, y_)
	{
		if (!obj_)
            return false;
        var sol = obj_.getCurrentSol();
        var instances = sol.getObjects();
		var current_event = this.runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		var cnd = this.runtime.getCurrentCondition();
		var i, len, inst, pick;
		if (sol.select_all)
		{
			cr.shallowAssignArray(tmp_arr, instances);
			sol.else_instances.length = 0;
			sol.select_all = false;
			sol.instances.length = 0;
		}
		else
		{
			if (orblock)
			{
				cr.shallowAssignArray(tmp_arr, sol.else_instances);
				sol.else_instances.length = 0;
			}
			else
			{
				cr.shallowAssignArray(tmp_arr, instances);
				sol.instances.length = 0;
			}
		}
		for (i = 0, len = tmp_arr.length; i < len; ++i)
		{
			inst = tmp_arr[i];
			pick = cr.xor(inst.contains_pt(x_, y_), cnd.inverted);
			if (pick)
				sol.instances.push(inst);
			else
				sol.else_instances.push(inst);
		}
		obj_.applySolToContainer();
		return cr.xor(!!sol.instances.length, cnd.inverted);
	};
	sysProto.cnds = new SysCnds();
    function SysActs() {};
    SysActs.prototype.GoToLayout = function(to)
    {
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
;
        this.runtime.changelayout = to;
    };
    SysActs.prototype.CreateObject = function (obj, layer, x, y)
    {
        if (!layer || !obj)
            return;
        var inst = this.runtime.createInstance(obj, layer, x, y);
		if (!inst)
			return;
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		this.runtime.isInOnDestroy--;
        var sol = obj.getCurrentSol();
        sol.select_all = false;
		sol.instances.length = 1;
		sol.instances[0] = inst;
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				sol.instances.length = 1;
				sol.instances[0] = s;
			}
		}
    };
    SysActs.prototype.SetLayerVisible = function (layer, visible_)
    {
        if (!layer)
            return;
		if (layer.visible !== visible_)
		{
			layer.visible = visible_;
			this.runtime.redraw = true;
		}
    };
	SysActs.prototype.SetLayerOpacity = function (layer, opacity_)
	{
		if (!layer)
			return;
		opacity_ = cr.clamp(opacity_ / 100, 0, 1);
		if (layer.opacity !== opacity_)
		{
			layer.opacity = opacity_;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayerScaleRate = function (layer, sr)
	{
		if (!layer)
			return;
		if (layer.zoomRate !== sr)
		{
			layer.zoomRate = sr;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayoutScale = function (s)
	{
		if (!this.runtime.running_layout)
			return;
		if (this.runtime.running_layout.scale !== s)
		{
			this.runtime.running_layout.scale = s;
			this.runtime.running_layout.boundScrolling();
			this.runtime.redraw = true;
		}
	};
    SysActs.prototype.ScrollX = function(x)
    {
        this.runtime.running_layout.scrollToX(x);
    };
    SysActs.prototype.ScrollY = function(y)
    {
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.Scroll = function(x, y)
    {
        this.runtime.running_layout.scrollToX(x);
        this.runtime.running_layout.scrollToY(y);
    };
    SysActs.prototype.ScrollToObject = function(obj)
    {
        var inst = obj.getFirstPicked();
        if (inst)
        {
            this.runtime.running_layout.scrollToX(inst.x);
            this.runtime.running_layout.scrollToY(inst.y);
        }
    };
	SysActs.prototype.SetVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(x);
			else
				v.setValue(parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(x.toString());
	};
	SysActs.prototype.AddVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(v.getValue() + x);
			else
				v.setValue(v.getValue() + parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(v.getValue() + x.toString());
	};
	SysActs.prototype.SubVar = function(v, x)
	{
;
		if (v.vartype === 0)
		{
			if (cr.is_number(x))
				v.setValue(v.getValue() - x);
			else
				v.setValue(v.getValue() - parseFloat(x));
		}
	};
    SysActs.prototype.SetGroupActive = function (group, active)
    {
		var activeGroups = this.runtime.activeGroups;
		var groupkey = (/*this.runtime.getCurrentAction().sheet.name + "|" + */group).toLowerCase();
		switch (active) {
		case 0:
			activeGroups[groupkey] = false;
			break;
		case 1:
			activeGroups[groupkey] = true;
			break;
		case 2:
			activeGroups[groupkey] = !activeGroups[groupkey];
			break;
		}
    };
    SysActs.prototype.SetTimescale = function (ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        this.runtime.timescale = ts;
    };
    SysActs.prototype.SetObjectTimescale = function (obj, ts_)
    {
        var ts = ts_;
        if (ts < 0)
            ts = 0;
        if (!obj)
            return;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = ts;
        }
    };
    SysActs.prototype.RestoreObjectTimescale = function (obj)
    {
        if (!obj)
            return false;
        var sol = obj.getCurrentSol();
        var instances = sol.getObjects();
        var i, len;
        for (i = 0, len = instances.length; i < len; i++)
        {
            instances[i].my_timescale = -1.0;
        }
    };
	var waitobjrecycle = [];
	function allocWaitObject()
	{
		var w;
		if (waitobjrecycle.length)
			w = waitobjrecycle.pop();
		else
		{
			w = {};
			w.sols = {};
			w.solModifiers = [];
		}
		w.deleteme = false;
		return w;
	};
	function freeWaitObject(w)
	{
		cr.wipe(w.sols);
		w.solModifiers.length = 0;
		waitobjrecycle.push(w);
	};
	var solstateobjects = [];
	function allocSolStateObject()
	{
		var s;
		if (solstateobjects.length)
			s = solstateobjects.pop();
		else
		{
			s = {};
			s.insts = [];
		}
		s.sa = false;
		return s;
	};
	function freeSolStateObject(s)
	{
		s.insts.length = 0;
		solstateobjects.push(s);
	};
	SysActs.prototype.Wait = function (seconds)
	{
		if (seconds < 0)
			return;
		var i, len, s, t, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = allocWaitObject();
		waitobj.time = this.runtime.kahanTime.sum + seconds;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;	// pointing at next action
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++)
		{
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
				continue;
			waitobj.solModifiers.push(t);
			ss = allocSolStateObject();
			ss.sa = s.select_all;
			cr.shallowAssignArray(ss.insts, s.instances);
			waitobj.sols[i.toString()] = ss;
		}
		this.waits.push(waitobj);
		return true;
	};
	SysActs.prototype.SetLayerScale = function (layer, scale)
    {
        if (!layer)
            return;
		if (layer.scale === scale)
			return;
        layer.scale = scale;
        this.runtime.redraw = true;
    };
	SysActs.prototype.ResetGlobals = function ()
	{
		var i, len, g;
		for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++)
		{
			g = this.runtime.all_global_vars[i];
			g.data = g.initial;
		}
	};
	SysActs.prototype.SetLayoutAngle = function (a)
	{
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.runtime.running_layout)
		{
			if (this.runtime.running_layout.angle !== a)
			{
				this.runtime.running_layout.angle = a;
				this.runtime.redraw = true;
			}
		}
	};
	SysActs.prototype.SetLayerAngle = function (layer, a)
    {
        if (!layer)
            return;
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (layer.angle === a)
			return;
        layer.angle = a;
        this.runtime.redraw = true;
    };
	SysActs.prototype.SetLayerParallax = function (layer, px, py)
    {
        if (!layer)
            return;
		if (layer.parallaxX === px / 100 && layer.parallaxY === py / 100)
			return;
        layer.parallaxX = px / 100;
		layer.parallaxY = py / 100;
        this.runtime.redraw = true;
    };
	SysActs.prototype.SetLayerBackground = function (layer, c)
    {
        if (!layer)
            return;
		var r = cr.GetRValue(c);
		var g = cr.GetGValue(c);
		var b = cr.GetBValue(c);
		if (layer.background_color[0] === r && layer.background_color[1] === g && layer.background_color[2] === b)
			return;
        layer.background_color[0] = r;
		layer.background_color[1] = g;
		layer.background_color[2] = b;
        this.runtime.redraw = true;
    };
	SysActs.prototype.SetLayerTransparent = function (layer, t)
    {
        if (!layer)
            return;
		if (!!t === !!layer.transparent)
			return;
		layer.transparent = !!t;
        this.runtime.redraw = true;
    };
	SysActs.prototype.StopLoop = function ()
	{
		if (this.runtime.loop_stack_index < 0)
			return;		// no loop currently running
		this.runtime.getCurrentLoop().stopped = true;
	};
	SysActs.prototype.GoToLayoutByName = function (layoutname)
	{
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to different layout
;
		var l;
		for (l in this.runtime.layouts)
		{
			if (this.runtime.layouts.hasOwnProperty(l) && cr.equals_nocase(l, layoutname))
			{
				this.runtime.changelayout = this.runtime.layouts[l];
				return;
			}
		}
	};
	SysActs.prototype.RestartLayout = function (layoutname)
	{
		if (this.runtime.isloading)
			return;		// cannot restart loader layouts
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
;
		if (!this.runtime.running_layout)
			return;
		this.runtime.changelayout = this.runtime.running_layout;
		var i, len, g;
		for (i = 0, len = this.runtime.allGroups.length; i < len; i++)
		{
			g = this.runtime.allGroups[i];
			this.runtime.activeGroups[g.group_name.toLowerCase()] = g.initially_activated;
		}
	};
	SysActs.prototype.SnapshotCanvas = function (format_, quality_)
	{
		this.runtime.snapshotCanvas = [format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100];
		this.runtime.redraw = true;		// force redraw so snapshot is always taken
	};
	SysActs.prototype.SetCanvasSize = function (w, h)
	{
		if (w <= 0 || h <= 0)
			return;
		this.runtime["setSize"](w, h);
	};
	SysActs.prototype.SetLayoutEffectEnabled = function (enable_, effectname_)
	{
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		this.runtime.running_layout.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectEnabled = function (layer, enable_, effectname_)
	{
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		layer.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayoutEffectParam = function (effectname_, index_, value_)
	{
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = this.runtime.running_layout.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectParam = function (layer, effectname_, index_, value_)
	{
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = layer.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SaveState = function (slot_)
	{
		this.runtime.saveToSlot = slot_;
	};
	SysActs.prototype.LoadState = function (slot_)
	{
		this.runtime.loadFromSlot = slot_;
	};
	SysActs.prototype.LoadStateJSON = function (jsonstr_)
	{
		this.runtime.loadFromJson = jsonstr_;
	};
	sysProto.acts = new SysActs();
    function SysExps() {};
    SysExps.prototype["int"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_int(parseInt(x, 10));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_int(x);
    };
    SysExps.prototype["float"] = function(ret, x)
    {
        if (cr.is_string(x))
        {
            ret.set_float(parseFloat(x));
            if (isNaN(ret.data))
                ret.data = 0;
        }
        else
            ret.set_float(x);
    };
    SysExps.prototype.str = function(ret, x)
    {
        if (cr.is_string(x))
            ret.set_string(x);
        else
            ret.set_string(x.toString());
    };
    SysExps.prototype.len = function(ret, x)
    {
        ret.set_int(x.length || 0);
    };
    SysExps.prototype.random = function (ret, a, b)
    {
        if (b === undefined)
        {
            ret.set_float(Math.random() * a);
        }
        else
        {
            ret.set_float(Math.random() * (b - a) + a);
        }
    };
    SysExps.prototype.sqrt = function(ret, x)
    {
        ret.set_float(Math.sqrt(x));
    };
    SysExps.prototype.abs = function(ret, x)
    {
        ret.set_float(Math.abs(x));
    };
    SysExps.prototype.round = function(ret, x)
    {
        ret.set_int(Math.round(x));
    };
    SysExps.prototype.floor = function(ret, x)
    {
        ret.set_int(Math.floor(x));
    };
    SysExps.prototype.ceil = function(ret, x)
    {
        ret.set_int(Math.ceil(x));
    };
    SysExps.prototype.sin = function(ret, x)
    {
        ret.set_float(Math.sin(cr.to_radians(x)));
    };
    SysExps.prototype.cos = function(ret, x)
    {
        ret.set_float(Math.cos(cr.to_radians(x)));
    };
    SysExps.prototype.tan = function(ret, x)
    {
        ret.set_float(Math.tan(cr.to_radians(x)));
    };
    SysExps.prototype.asin = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.asin(x)));
    };
    SysExps.prototype.acos = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.acos(x)));
    };
    SysExps.prototype.atan = function(ret, x)
    {
        ret.set_float(cr.to_degrees(Math.atan(x)));
    };
    SysExps.prototype.exp = function(ret, x)
    {
        ret.set_float(Math.exp(x));
    };
    SysExps.prototype.ln = function(ret, x)
    {
        ret.set_float(Math.log(x));
    };
    SysExps.prototype.log10 = function(ret, x)
    {
        ret.set_float(Math.log(x) / Math.LN10);
    };
    SysExps.prototype.max = function(ret)
    {
		var max_ = arguments[1];
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
		{
			if (max_ < arguments[i])
				max_ = arguments[i];
		}
		ret.set_float(max_);
    };
    SysExps.prototype.min = function(ret)
    {
        var min_ = arguments[1];
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
		{
			if (min_ > arguments[i])
				min_ = arguments[i];
		}
		ret.set_float(min_);
    };
    SysExps.prototype.dt = function(ret)
    {
        ret.set_float(this.runtime.dt);
    };
    SysExps.prototype.timescale = function(ret)
    {
        ret.set_float(this.runtime.timescale);
    };
    SysExps.prototype.wallclocktime = function(ret)
    {
        ret.set_float((Date.now() - this.runtime.start_time) / 1000.0);
    };
    SysExps.prototype.time = function(ret)
    {
        ret.set_float(this.runtime.kahanTime.sum);
    };
    SysExps.prototype.tickcount = function(ret)
    {
        ret.set_int(this.runtime.tickcount);
    };
    SysExps.prototype.objectcount = function(ret)
    {
        ret.set_int(this.runtime.objectcount);
    };
    SysExps.prototype.fps = function(ret)
    {
        ret.set_int(this.runtime.fps);
    };
    SysExps.prototype.loopindex = function(ret, name_)
    {
		var loop, i, len;
        if (!this.runtime.loop_stack.length)
        {
            ret.set_int(0);
            return;
        }
        if (name_)
        {
            for (i = 0, len = this.runtime.loop_stack.length; i < len; i++)
            {
                loop = this.runtime.loop_stack[i];
                if (loop.name === name_)
                {
                    ret.set_int(loop.index);
                    return;
                }
            }
            ret.set_int(0);
        }
        else
        {
			loop = this.runtime.getCurrentLoop();
			ret.set_int(loop ? loop.index : -1);
        }
    };
    SysExps.prototype.distance = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.distanceTo(x1, y1, x2, y2));
    };
    SysExps.prototype.angle = function(ret, x1, y1, x2, y2)
    {
        ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)));
    };
    SysExps.prototype.scrollx = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollX);
    };
    SysExps.prototype.scrolly = function(ret)
    {
        ret.set_float(this.runtime.running_layout.scrollY);
    };
    SysExps.prototype.newline = function(ret)
    {
        ret.set_string("\n");
    };
    SysExps.prototype.lerp = function(ret, a, b, x)
    {
        ret.set_float(cr.lerp(a, b, x));
    };
    SysExps.prototype.windowwidth = function(ret)
    {
        ret.set_int(this.runtime.width);
    };
    SysExps.prototype.windowheight = function(ret)
    {
        ret.set_int(this.runtime.height);
    };
	SysExps.prototype.uppercase = function(ret, str)
	{
		ret.set_string(cr.is_string(str) ? str.toUpperCase() : "");
	};
	SysExps.prototype.lowercase = function(ret, str)
	{
		ret.set_string(cr.is_string(str) ? str.toLowerCase() : "");
	};
	SysExps.prototype.clamp = function(ret, x, l, u)
	{
		if (x < l)
			ret.set_float(l);
		else if (x > u)
			ret.set_float(u);
		else
			ret.set_float(x);
	};
	SysExps.prototype.layerscale = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.scale);
	};
	SysExps.prototype.layeropacity = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.opacity * 100);
	};
	SysExps.prototype.layerscalerate = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.zoomRate);
	};
	SysExps.prototype.layerparallaxx = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.parallaxX * 100);
	};
	SysExps.prototype.layerparallaxy = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.parallaxY * 100);
	};
	SysExps.prototype.layoutscale = function (ret)
	{
		if (this.runtime.running_layout)
			ret.set_float(this.runtime.running_layout.scale);
		else
			ret.set_float(0);
	};
	SysExps.prototype.layoutangle = function (ret)
	{
		ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));
	};
	SysExps.prototype.layerangle = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(cr.to_degrees(layer.angle));
	};
	SysExps.prototype.layoutwidth = function (ret)
	{
		ret.set_int(this.runtime.running_layout.width);
	};
	SysExps.prototype.layoutheight = function (ret)
	{
		ret.set_int(this.runtime.running_layout.height);
	};
	SysExps.prototype.find = function (ret, text, searchstr)
	{
		if (cr.is_string(text) && cr.is_string(searchstr))
			ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
		else
			ret.set_int(-1);
	};
	SysExps.prototype.left = function (ret, text, n)
	{
		ret.set_string(cr.is_string(text) ? text.substr(0, n) : "");
	};
	SysExps.prototype.right = function (ret, text, n)
	{
		ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "");
	};
	SysExps.prototype.mid = function (ret, text, index_, length_)
	{
		ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "");
	};
	SysExps.prototype.tokenat = function (ret, text, index_, sep)
	{
		if (cr.is_string(text) && cr.is_string(sep))
		{
			var arr = text.split(sep);
			var i = cr.floor(index_);
			if (i < 0 || i >= arr.length)
				ret.set_string("");
			else
				ret.set_string(arr[i]);
		}
		else
			ret.set_string("");
	};
	SysExps.prototype.tokencount = function (ret, text, sep)
	{
		if (cr.is_string(text) && text.length)
			ret.set_int(text.split(sep).length);
		else
			ret.set_int(0);
	};
	SysExps.prototype.replace = function (ret, text, find_, replace_)
	{
		if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_))
			ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
		else
			ret.set_string(cr.is_string(text) ? text : "");
	};
	SysExps.prototype.trim = function (ret, text)
	{
		ret.set_string(cr.is_string(text) ? text.trim() : "");
	};
	SysExps.prototype.pi = function (ret)
	{
		ret.set_float(cr.PI);
	};
	SysExps.prototype.layoutname = function (ret)
	{
		if (this.runtime.running_layout)
			ret.set_string(this.runtime.running_layout.name);
		else
			ret.set_string("");
	};
	SysExps.prototype.renderer = function (ret)
	{
		ret.set_string(this.runtime.gl ? "webgl" : "canvas2d");
	};
	SysExps.prototype.anglediff = function (ret, a, b)
	{
		ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))));
	};
	SysExps.prototype.choose = function (ret)
	{
		var index = cr.floor(Math.random() * (arguments.length - 1));
		ret.set_any(arguments[index + 1]);
	};
	SysExps.prototype.rgb = function (ret, r, g, b)
	{
		ret.set_int(cr.RGB(r, g, b));
	};
	SysExps.prototype.projectversion = function (ret)
	{
		ret.set_string(this.runtime.versionstr);
	};
	SysExps.prototype.anglelerp = function (ret, a, b, x)
	{
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a))
		{
			ret.set_float(cr.to_clamped_degrees(a + diff * x));
		}
		else
		{
			ret.set_float(cr.to_clamped_degrees(a - diff * x));
		}
	};
	SysExps.prototype.anglerotate = function (ret, a, b, c)
	{
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		c = cr.to_radians(c);
		ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)));
	};
	SysExps.prototype.zeropad = function (ret, n, d)
	{
		var s = (n < 0 ? "-" : "");
		if (n < 0) n = -n;
		var zeroes = d - n.toString().length;
		for (var i = 0; i < zeroes; i++)
			s += "0";
		ret.set_string(s + n.toString());
	};
	SysExps.prototype.cpuutilisation = function (ret)
	{
		ret.set_float(this.runtime.cpuutilisation / 1000);
	};
	SysExps.prototype.viewportleft = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewLeft : 0);
	};
	SysExps.prototype.viewporttop = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewTop : 0);
	};
	SysExps.prototype.viewportright = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewRight : 0);
	};
	SysExps.prototype.viewportbottom = function (ret, layerparam)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewBottom : 0);
	};
	SysExps.prototype.loadingprogress = function (ret)
	{
		ret.set_float(this.runtime.loadingprogress);
	};
	SysExps.prototype.unlerp = function(ret, a, b, y)
    {
        ret.set_float((y - a) / (b - a));
    };
	SysExps.prototype.canvassnapshot = function (ret)
	{
		ret.set_string(this.runtime.snapshotData);
	};
	SysExps.prototype.urlencode = function (ret, s)
	{
		ret.set_string(encodeURIComponent(s));
	};
	SysExps.prototype.urldecode = function (ret, s)
	{
		ret.set_string(decodeURIComponent(s));
	};
	SysExps.prototype.canvastolayerx = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0);
	};
	SysExps.prototype.canvastolayery = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0);
	};
	SysExps.prototype.layertocanvasx = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0);
	};
	SysExps.prototype.layertocanvasy = function (ret, layerparam, x, y)
	{
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0);
	};
	SysExps.prototype.savestatejson = function (ret)
	{
		ret.set_string(this.runtime.lastSaveJson);
	};
	SysExps.prototype.imagememoryusage = function (ret)
	{
		if (this.runtime.glwrap)
			ret.set_float(Math.round(100 * this.runtime.glwrap.estimateVRAM() / (1024 * 1024)) / 100);
		else
			ret.set_float(0);
	};
	SysExps.prototype.regexsearch = function (ret, str_, regex_, flags_)
	{
		var regex = getRegex(regex_, flags_);
		ret.set_int(str_ ? str_.search(regex) : -1);
	};
	SysExps.prototype.regexreplace = function (ret, str_, regex_, flags_, replace_)
	{
		var regex = getRegex(regex_, flags_);
		ret.set_string(str_ ? str_.replace(regex, replace_) : "");
	};
	var regexMatches = [];
	var lastMatchesStr = "";
	var lastMatchesRegex = "";
	var lastMatchesFlags = "";
	function updateRegexMatches(str_, regex_, flags_)
	{
		if (str_ === lastMatchesStr && regex_ === lastMatchesRegex && flags_ === lastMatchesFlags)
			return;
		var regex = getRegex(regex_, flags_);
		regexMatches = str_.match(regex);
		lastMatchesStr = str_;
		lastMatchesRegex = regex_;
		lastMatchesFlags = flags_;
	};
	SysExps.prototype.regexmatchcount = function (ret, str_, regex_, flags_)
	{
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		ret.set_int(regexMatches ? regexMatches.length : 0);
	};
	SysExps.prototype.regexmatchat = function (ret, str_, regex_, flags_, index_)
	{
		index_ = Math.floor(index_);
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		if (!regexMatches || index_ < 0 || index_ >= regexMatches.length)
			ret.set_string("");
		else
			ret.set_string(regexMatches[index_]);
	};
	SysExps.prototype.infinity = function (ret)
	{
		ret.set_float(Infinity);
	};
	sysProto.exps = new SysExps();
	sysProto.runWaits = function ()
	{
		var i, j, len, w, k, s, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		for (i = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			if (w.time > this.runtime.kahanTime.sum)
				continue;
			evinfo.current_event = w.ev;
			evinfo.actindex = w.actindex;
			evinfo.cndindex = 0;
			for (k in w.sols)
			{
				if (w.sols.hasOwnProperty(k))
				{
					s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
					ss = w.sols[k];
					s.select_all = ss.sa;
					cr.shallowAssignArray(s.instances, ss.insts);
					freeSolStateObject(ss);
				}
			}
			w.ev.resume_actions_and_subevents();
			this.runtime.clearSol(w.solModifiers);
			w.deleteme = true;
		}
		for (i = 0, j = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			this.waits[j] = w;
			if (w.deleteme)
				freeWaitObject(w);
			else
				j++;
		}
		this.waits.length = j;
	};
}());
;
cr.add_common_aces = function (m)
{
	var pluginProto = m[0].prototype;
	var singleglobal_ = m[1];
	var position_aces = m[3];
	var size_aces = m[4];
	var angle_aces = m[5];
	var appearance_aces = m[6];
	var zorder_aces = m[7];
	var effects_aces = m[8];
    if (!pluginProto.cnds)
        pluginProto.cnds = {};
    if (!pluginProto.acts)
        pluginProto.acts = {};
    if (!pluginProto.exps)
        pluginProto.exps = {};
    var cnds = pluginProto.cnds;
    var acts = pluginProto.acts;
    var exps = pluginProto.exps;
    if (position_aces)
    {
        cnds.CompareX = function (cmp, x)
        {
            return cr.do_cmp(this.x, cmp, x);
        };
        cnds.CompareY = function (cmp, y)
        {
            return cr.do_cmp(this.y, cmp, y);
        };
        cnds.IsOnScreen = function ()
        {
			var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;
            return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom);
        };
        cnds.IsOutsideLayout = function ()
        {
            this.update_bbox();
            var bbox = this.bbox;
            var layout = this.runtime.running_layout;
            return (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height);
        };
		cnds.PickDistance = function (which, x, y)
		{
			var sol = this.getCurrentSol();
			var instances = sol.getObjects();
			if (!instances.length)
				return false;
			var inst = instances[0];
			var pickme = inst;
			var dist = cr.distanceTo(inst.x, inst.y, x, y);
			var i, len, d;
			for (i = 1, len = instances.length; i < len; i++)
			{
				inst = instances[i];
				d = cr.distanceTo(inst.x, inst.y, x, y);
				if ((which === 0 && d < dist) || (which === 1 && d > dist))
				{
					dist = d;
					pickme = inst;
				}
			}
			sol.pick_one(pickme);
			return true;
		};
        acts.SetX = function (x)
        {
            if (this.x !== x)
            {
                this.x = x;
                this.set_bbox_changed();
            }
        };
        acts.SetY = function (y)
        {
            if (this.y !== y)
            {
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPos = function (x, y)
        {
            if (this.x !== x || this.y !== y)
            {
                this.x = x;
                this.y = y;
                this.set_bbox_changed();
            }
        };
        acts.SetPosToObject = function (obj, imgpt)
        {
            var inst = obj.getPairedInstance(this);
            if (!inst)
				return;
			var newx, newy;
			if (inst.getImagePoint)
			{
				newx = inst.getImagePoint(imgpt, true);
				newy = inst.getImagePoint(imgpt, false);
			}
			else
			{
				newx = inst.x;
				newy = inst.y;
			}
			if (this.x !== newx || this.y !== newy)
            {
				this.x = newx;
				this.y = newy;
				this.set_bbox_changed();
            }
        };
        acts.MoveForward = function (dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(this.angle) * dist;
                this.y += Math.sin(this.angle) * dist;
                this.set_bbox_changed();
            }
        };
        acts.MoveAtAngle = function (a, dist)
        {
            if (dist !== 0)
            {
                this.x += Math.cos(cr.to_radians(a)) * dist;
                this.y += Math.sin(cr.to_radians(a)) * dist;
                this.set_bbox_changed();
            }
        };
        exps.X = function (ret)
        {
            ret.set_float(this.x);
        };
        exps.Y = function (ret)
        {
            ret.set_float(this.y);
        };
        exps.dt = function (ret)
        {
            ret.set_float(this.runtime.getDt(this));
        };
    }
    if (size_aces)
    {
        cnds.CompareWidth = function (cmp, w)
        {
            return cr.do_cmp(this.width, cmp, w);
        };
        cnds.CompareHeight = function (cmp, h)
        {
            return cr.do_cmp(this.height, cmp, h);
        };
        acts.SetWidth = function (w)
        {
            if (this.width !== w)
            {
                this.width = w;
                this.set_bbox_changed();
            }
        };
        acts.SetHeight = function (h)
        {
            if (this.height !== h)
            {
                this.height = h;
                this.set_bbox_changed();
            }
        };
        acts.SetSize = function (w, h)
        {
            if (this.width !== w || this.height !== h)
            {
                this.width = w;
                this.height = h;
                this.set_bbox_changed();
            }
        };
        exps.Width = function (ret)
        {
            ret.set_float(this.width);
        };
        exps.Height = function (ret)
        {
            ret.set_float(this.height);
        };
		exps.BBoxLeft = function (ret)
        {
			this.update_bbox();
            ret.set_float(this.bbox.left);
        };
		exps.BBoxTop = function (ret)
        {
			this.update_bbox();
            ret.set_float(this.bbox.top);
        };
		exps.BBoxRight = function (ret)
        {
			this.update_bbox();
            ret.set_float(this.bbox.right);
        };
		exps.BBoxBottom = function (ret)
        {
			this.update_bbox();
            ret.set_float(this.bbox.bottom);
        };
    }
    if (angle_aces)
    {
        cnds.AngleWithin = function (within, a)
        {
            return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within);
        };
        cnds.IsClockwiseFrom = function (a)
        {
            return cr.angleClockwise(this.angle, cr.to_radians(a));
        };
		cnds.IsBetweenAngles = function (a, b)
		{
			var lower = cr.to_clamped_radians(a);
			var upper = cr.to_clamped_radians(b);
			var angle = cr.clamp_angle(this.angle);
			var obtuse = (!cr.angleClockwise(upper, lower));
			if (obtuse)
				return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
			else
				return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
		};
        acts.SetAngle = function (a)
        {
            var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateClockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle += cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateCounterclockwise = function (a)
        {
            if (a !== 0 && !isNaN(a))
            {
                this.angle -= cr.to_radians(a);
                this.angle = cr.clamp_angle(this.angle);
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardAngle = function (amt, target)
        {
            var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.RotateTowardPosition = function (amt, x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var target = Math.atan2(dy, dx);
            var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        acts.SetTowardPosition = function (x, y)
        {
            var dx = x - this.x;
            var dy = y - this.y;
            var newangle = Math.atan2(dy, dx);
            if (isNaN(newangle))
                return;
            if (this.angle !== newangle)
            {
                this.angle = newangle;
                this.set_bbox_changed();
            }
        };
        exps.Angle = function (ret)
        {
            ret.set_float(cr.to_clamped_degrees(this.angle));
        };
    }
    if (!singleglobal_)
    {
        cnds.CompareInstanceVar = function (iv, cmp, val)
        {
            return cr.do_cmp(this.instance_vars[iv], cmp, val);
        };
        cnds.IsBoolInstanceVarSet = function (iv)
        {
            return this.instance_vars[iv];
        };
		cnds.PickInstVarHiLow = function (which, iv)
		{
			var sol = this.getCurrentSol();
			var instances = sol.getObjects();
			if (!instances.length)
				return false;
			var inst = instances[0];
			var pickme = inst;
			var val = inst.instance_vars[iv];
			var i, len, v;
			for (i = 1, len = instances.length; i < len; i++)
			{
				inst = instances[i];
				v = inst.instance_vars[iv];
				if ((which === 0 && v < val) || (which === 1 && v > val))
				{
					val = v;
					pickme = inst;
				}
			}
			sol.pick_one(pickme);
			return true;
		};
		cnds.PickByUID = function (u)
		{
			var i, len, j, inst, families, instances, sol;
			var cnd = this.runtime.getCurrentCondition();
			if (cnd.inverted)
			{
				sol = this.getCurrentSol();
				if (sol.select_all)
				{
					sol.select_all = false;
					sol.instances.length = 0;
					sol.else_instances.length = 0;
					instances = this.instances;
					for (i = 0, len = instances.length; i < len; i++)
					{
						inst = instances[i];
						if (inst.uid === u)
							sol.else_instances.push(inst);
						else
							sol.instances.push(inst);
					}
					return !!sol.instances.length;
				}
				else
				{
					for (i = 0, j = 0, len = sol.instances.length; i < len; i++)
					{
						inst = sol.instances[i];
						sol.instances[j] = inst;
						if (inst.uid === u)
						{
							sol.else_instances.push(inst);
						}
						else
							j++;
					}
					sol.instances.length = j;
					return !!sol.instances.length;
				}
			}
			else
			{
				inst = this.runtime.getObjectByUID(u);
				if (!inst)
					return false;
				sol = this.getCurrentSol();
				if (!sol.select_all && sol.instances.indexOf(inst) === -1)
					return false;		// not picked
				if (this.is_family)
				{
					families = inst.type.families;
					for (i = 0, len = families.length; i < len; i++)
					{
						if (families[i] === this)
						{
							sol.pick_one(inst);
							return true;
						}
					}
				}
				else if (inst.type === this)
				{
					sol.pick_one(inst);
					return true;
				}
				return false;
			}
		};
		cnds.OnCreated = function ()
		{
			return true;
		};
		cnds.OnDestroyed = function ()
		{
			return true;
		};
        acts.SetInstanceVar = function (iv, val)
        {
			var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] = val;
                else
                    myinstvars[iv] = val.toString();
            }
            else
;
        };
        acts.AddInstanceVar = function (iv, val)
        {
			var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += parseFloat(val);
            }
            else if (cr.is_string(myinstvars[iv]))
            {
                if (cr.is_string(val))
                    myinstvars[iv] += val;
                else
                    myinstvars[iv] += val.toString();
            }
            else
;
        };
        acts.SubInstanceVar = function (iv, val)
        {
			var myinstvars = this.instance_vars;
            if (cr.is_number(myinstvars[iv]))
            {
                if (cr.is_number(val))
                    myinstvars[iv] -= val;
                else
                    myinstvars[iv] -= parseFloat(val);
            }
            else
;
        };
        acts.SetBoolInstanceVar = function (iv, val)
        {
            this.instance_vars[iv] = val ? 1 : 0;
        };
        acts.ToggleBoolInstanceVar = function (iv)
        {
            this.instance_vars[iv] = 1 - this.instance_vars[iv];
        };
        acts.Destroy = function ()
        {
            this.runtime.DestroyInstance(this);
        };
        exps.Count = function (ret)
        {
			var count = ret.object_class.instances.length;
			var i, len, inst;
			for (i = 0, len = this.runtime.createRow.length; i < len; i++)
			{
				inst = this.runtime.createRow[i];
				if (ret.object_class.is_family)
				{
					if (inst.type.families.indexOf(ret.object_class) >= 0)
						count++;
				}
				else
				{
					if (inst.type === ret.object_class)
						count++;
				}
			}
            ret.set_int(count);
        };
		exps.PickedCount = function (ret)
        {
            ret.set_int(ret.object_class.getCurrentSol().getObjects().length);
        };
		exps.UID = function (ret)
		{
			ret.set_int(this.uid);
		};
		exps.IID = function (ret)
		{
			ret.set_int(this.get_iid());
		};
    }
    if (appearance_aces)
    {
        cnds.IsVisible = function ()
        {
            return this.visible;
        };
        acts.SetVisible = function (v)
        {
			if (!v !== !this.visible)
			{
				this.visible = v;
				this.runtime.redraw = true;
			}
        };
        cnds.CompareOpacity = function (cmp, x)
        {
            return cr.do_cmp(cr.round6dp(this.opacity * 100), cmp, x);
        };
        acts.SetOpacity = function (x)
        {
            var new_opacity = x / 100.0;
            if (new_opacity < 0)
                new_opacity = 0;
            else if (new_opacity > 1)
                new_opacity = 1;
            if (new_opacity !== this.opacity)
            {
                this.opacity = new_opacity;
                this.runtime.redraw = true;
            }
        };
        exps.Opacity = function (ret)
        {
            ret.set_float(cr.round6dp(this.opacity * 100.0));
        };
    }
	if (zorder_aces)
	{
		cnds.IsOnLayer = function (layer_)
		{
			if (!layer_)
				return false;
			return this.layer === layer_;
		};
		cnds.PickTopBottom = function (which_)
		{
			var sol = this.getCurrentSol();
			var instances = sol.getObjects();
			if (!instances.length)
				return false;
			var inst = instances[0];
			var pickme = inst;
			var i, len;
			for (i = 1, len = instances.length; i < len; i++)
			{
				inst = instances[i];
				if (which_ === 0)
				{
					if (inst.layer.index > pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex()))
					{
						pickme = inst;
					}
				}
				else
				{
					if (inst.layer.index < pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex()))
					{
						pickme = inst;
					}
				}
			}
			sol.pick_one(pickme);
			return true;
		};
		acts.MoveToTop = function ()
		{
			var zindex = this.get_zindex();
			if (zindex === this.layer.instances.length - 1)
				return;
			cr.arrayRemove(this.layer.instances, zindex);
			this.layer.instances.push(this);
			this.runtime.redraw = true;
			this.layer.zindices_stale = true;
		};
		acts.MoveToBottom = function ()
		{
			var zindex = this.get_zindex();
			if (zindex === 0)
				return;
			cr.arrayRemove(this.layer.instances, zindex);
			this.layer.instances.unshift(this);
			this.runtime.redraw = true;
			this.layer.zindices_stale = true;
		};
		acts.MoveToLayer = function (layerMove)
		{
			if (!layerMove || layerMove == this.layer)
				return;
			cr.arrayRemove(this.layer.instances, this.get_zindex());
			this.layer.zindices_stale = true;
			this.layer = layerMove;
			this.zindex = layerMove.instances.length;
			layerMove.instances.push(this);
			this.runtime.redraw = true;
		};
		acts.ZMoveToObject = function (where_, obj_)
		{
			var isafter = (where_ === 0);
			if (!obj_)
				return;
			var other = obj_.getFirstPicked(this);
			if (!other || other.uid === this.uid)
				return;
			if (this.layer.index !== other.layer.index)
			{
				cr.arrayRemove(this.layer.instances, this.get_zindex());
				this.layer.zindices_stale = true;
				this.layer = other.layer;
				this.zindex = other.layer.instances.length;
				other.layer.instances.push(this);
			}
			var myZ = this.get_zindex();
			var insertZ = other.get_zindex();
			cr.arrayRemove(this.layer.instances, myZ);
			if (myZ < insertZ)
				insertZ--;
			if (isafter)
				insertZ++;
			if (insertZ === this.layer.instances.length)
				this.layer.instances.push(this);
			else
				this.layer.instances.splice(insertZ, 0, this);
			this.layer.zindices_stale = true;
			this.runtime.redraw = true;
		};
		exps.LayerNumber = function (ret)
		{
			ret.set_int(this.layer.number);
		};
		exps.LayerName = function (ret)
		{
			ret.set_string(this.layer.name);
		};
		exps.ZIndex = function (ret)
		{
			ret.set_int(this.get_zindex());
		};
	}
	if (effects_aces)
	{
		acts.SetEffectEnabled = function (enable_, effectname_)
		{
			if (!this.runtime.glwrap)
				return;
			var i = this.type.getEffectIndexByName(effectname_);
			if (i < 0)
				return;		// effect name not found
			var enable = (enable_ === 1);
			if (this.active_effect_flags[i] === enable)
				return;		// no change
			this.active_effect_flags[i] = enable;
			this.updateActiveEffects();
			this.runtime.redraw = true;
		};
		acts.SetEffectParam = function (effectname_, index_, value_)
		{
			if (!this.runtime.glwrap)
				return;
			var i = this.type.getEffectIndexByName(effectname_);
			if (i < 0)
				return;		// effect name not found
			var et = this.type.effect_types[i];
			var params = this.effect_params[i];
			index_ = Math.floor(index_);
			if (index_ < 0 || index_ >= params.length)
				return;		// effect index out of bounds
			if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
				value_ /= 100.0;
			if (params[index_] === value_)
				return;		// no change
			params[index_] = value_;
			if (et.active)
				this.runtime.redraw = true;
		};
	}
};
cr.set_bbox_changed = function ()
{
    this.bbox_changed = true;       // will recreate next time box requested
    this.runtime.redraw = true;     // assume runtime needs to redraw
	var i, len;
	for (i = 0, len = this.bbox_changed_callbacks.length; i < len; i++)
	{
		this.bbox_changed_callbacks[i](this);
	}
};
cr.add_bbox_changed_callback = function (f)
{
	if (f)
		this.bbox_changed_callbacks.push(f);
};
cr.update_bbox = function ()
{
    if (!this.bbox_changed)
        return;                 // bounding box not changed
    this.bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
    this.bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
    if (!this.angle)
    {
        this.bquad.set_from_rect(this.bbox);    // make bounding quad from box
    }
    else
    {
        this.bbox.offset(-this.x, -this.y);       					// translate to origin
        this.bquad.set_from_rotated_rect(this.bbox, this.angle);	// rotate around origin
        this.bquad.offset(this.x, this.y);      					// translate back to original position
        this.bquad.bounding_box(this.bbox);
    }
	var temp = 0;
	if (this.bbox.left > this.bbox.right)
	{
		temp = this.bbox.left;
		this.bbox.left = this.bbox.right;
		this.bbox.right = temp;
	}
	if (this.bbox.top > this.bbox.bottom)
	{
		temp = this.bbox.top;
		this.bbox.top = this.bbox.bottom;
		this.bbox.bottom = temp;
	}
    this.bbox_changed = false;  // bounding box up to date
};
cr.inst_contains_pt = function (x, y)
{
	if (!this.bbox.contains_pt(x, y))
		return false;
	if (!this.bquad.contains_pt(x, y))
		return false;
	if (this.collision_poly && !this.collision_poly.is_empty())
	{
		this.collision_poly.cache_poly(this.width, this.height, this.angle);
		return this.collision_poly.contains_pt(x - this.x, y - this.y);
	}
	else
		return true;
};
cr.inst_get_iid = function ()
{
	this.type.updateIIDs();
	return this.iid;
};
cr.inst_get_zindex = function ()
{
	this.layer.updateZIndices();
	return this.zindex;
};
cr.inst_updateActiveEffects = function ()
{
	this.active_effect_types.length = 0;
	var i, len, et, inst;
	for (i = 0, len = this.active_effect_flags.length; i < len; i++)
	{
		if (this.active_effect_flags[i])
			this.active_effect_types.push(this.type.effect_types[i]);
	}
	this.uses_shaders = !!this.active_effect_types.length;
};
cr.inst_toString = function ()
{
	return "Inst" + this.puid;
};
cr.type_getFirstPicked = function (frominst)
{
	if (frominst && frominst.is_contained && frominst.type != this)
	{
		var i, len, s;
		for (i = 0, len = frominst.siblings.length; i < len; i++)
		{
			s = frominst.siblings[i];
			if (s.type == this)
				return s;
		}
	}
    var instances = this.getCurrentSol().getObjects();
    if (instances.length)
        return instances[0];
    else
        return null;
};
cr.type_getPairedInstance = function (inst)
{
	var instances = this.getCurrentSol().getObjects();
	if (instances.length)
		return instances[inst.get_iid() % instances.length];
	else
		return null;
};
cr.type_updateIIDs = function ()
{
	if (!this.stale_iids || this.is_family)
		return;		// up to date or is family - don't want family to overwrite IIDs
	var i, len;
	for (i = 0, len = this.instances.length; i < len; i++)
		this.instances[i].iid = i;
	var next_iid = i;
	var createRow = this.runtime.createRow;
	for (i = 0, len = createRow.length; i < len; ++i)
	{
		if (createRow[i].type === this)
			createRow[i].iid = next_iid++;
	}
	this.stale_iids = false;
};
cr.type_getCurrentSol = function ()
{
    return this.solstack[this.cur_sol];
};
cr.type_pushCleanSol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    else
        this.solstack[this.cur_sol].select_all = true;  // else clear next SOL
};
cr.type_pushCopySol = function ()
{
    this.cur_sol++;
    if (this.cur_sol === this.solstack.length)
        this.solstack.push(new cr.selection(this));
    var clonesol = this.solstack[this.cur_sol];
    var prevsol = this.solstack[this.cur_sol - 1];
    if (prevsol.select_all)
        clonesol.select_all = true;
    else
    {
        clonesol.select_all = false;
		cr.shallowAssignArray(clonesol.instances, prevsol.instances);
    }
};
cr.type_popSol = function ()
{
;
    this.cur_sol--;
};
cr.type_getBehaviorByName = function (behname)
{
    var i, len, j, lenj, f, index = 0;
	if (!this.is_family)
	{
		for (i = 0, len = this.families.length; i < len; i++)
		{
			f = this.families[i];
			for (j = 0, lenj = f.behaviors.length; j < lenj; j++)
			{
				if (behname === f.behaviors[j].name)
				{
					this.extra.lastBehIndex = index;
					return f.behaviors[j];
				}
				index++;
			}
		}
	}
    for (i = 0, len = this.behaviors.length; i < len; i++) {
        if (behname === this.behaviors[i].name)
		{
			this.extra.lastBehIndex = index;
            return this.behaviors[i];
		}
		index++;
    }
	return null;
};
cr.type_getBehaviorIndexByName = function (behname)
{
    var b = this.getBehaviorByName(behname);
	if (b)
		return this.extra.lastBehIndex;
	else
		return -1;
};
cr.type_getEffectIndexByName = function (name_)
{
	var i, len;
	for (i = 0, len = this.effect_types.length; i < len; i++)
	{
		if (this.effect_types[i].name === name_)
			return i;
	}
	return -1;
};
cr.type_applySolToContainer = function ()
{
	if (!this.is_contained || this.is_family)
		return;
	var i, len, j, lenj, t, sol, sol2;
	this.updateIIDs();
	sol = this.getCurrentSol();
	var select_all = sol.select_all;
	var es = this.runtime.getCurrentEventStack();
	var orblock = es && es.current_event && es.current_event.orblock;
	for (i = 0, len = this.container.length; i < len; i++)
	{
		t = this.container[i];
		if (t === this)
			continue;
		t.updateIIDs();
		sol2 = t.getCurrentSol();
		sol2.select_all = select_all;
		if (!select_all)
		{
			sol2.instances.length = sol.instances.length;
			for (j = 0, lenj = sol.instances.length; j < lenj; j++)
				sol2.instances[j] = t.instances[sol.instances[j].iid];
			if (orblock)
			{
				sol2.else_instances.length = sol.else_instances.length;
				for (j = 0, lenj = sol.else_instances.length; j < lenj; j++)
					sol2.else_instances[j] = t.instances[sol.else_instances[j].iid];
			}
		}
	}
};
cr.type_toString = function ()
{
	return "Type" + this.sid;
};
cr.do_cmp = function (x, cmp, y)
{
	if (typeof x === "undefined" || typeof y === "undefined")
		return false;
    switch (cmp)
    {
        case 0:     // equal
            return x === y;
        case 1:     // not equal
            return x !== y;
        case 2:     // less
            return x < y;
        case 3:     // less/equal
            return x <= y;
        case 4:     // greater
            return x > y;
        case 5:     // greater/equal
            return x >= y;
        default:
;
            return false;
    }
};
cr.shaders = {};
cr.shaders["glowhorizontal"] = {src: ["varying mediump vec2 vTex;",
"uniform mediump sampler2D samplerFront;",
"uniform mediump float pixelWidth;",
"uniform mediump float intensity;",
"void main(void)",
"{",
"mediump vec4 sum = vec4(0.0);",
"mediump float halfPixelWidth = pixelWidth / 2.0;",
"sum += texture2D(samplerFront, vTex - vec2(pixelWidth * 7.0 + halfPixelWidth, 0.0)) * 0.06;",
"sum += texture2D(samplerFront, vTex - vec2(pixelWidth * 5.0 + halfPixelWidth, 0.0)) * 0.10;",
"sum += texture2D(samplerFront, vTex - vec2(pixelWidth * 3.0 + halfPixelWidth, 0.0)) * 0.13;",
"sum += texture2D(samplerFront, vTex - vec2(pixelWidth * 1.0 + halfPixelWidth, 0.0)) * 0.16;",
"mediump vec4 front = texture2D(samplerFront, vTex);",
"sum += front * 0.10;",
"sum += texture2D(samplerFront, vTex + vec2(pixelWidth * 1.0 + halfPixelWidth, 0.0)) * 0.16;",
"sum += texture2D(samplerFront, vTex + vec2(pixelWidth * 3.0 + halfPixelWidth, 0.0)) * 0.13;",
"sum += texture2D(samplerFront, vTex + vec2(pixelWidth * 5.0 + halfPixelWidth, 0.0)) * 0.10;",
"sum += texture2D(samplerFront, vTex + vec2(pixelWidth * 7.0 + halfPixelWidth, 0.0)) * 0.06;",
"gl_FragColor = mix(front, max(front, sum), intensity);",
"}"
].join("\n"),
	extendBoxHorizontal: 8,
	extendBoxVertical: 0,
	crossSampling: false,
	animated: false,
	parameters: [["intensity", 0, 1]] }
cr.shaders["glowvertical"] = {src: ["varying mediump vec2 vTex;",
"uniform mediump sampler2D samplerFront;",
"uniform mediump float pixelHeight;",
"uniform mediump float intensity;",
"void main(void)",
"{",
"mediump vec4 sum = vec4(0.0);",
"mediump float halfPixelHeight = pixelHeight / 2.0;",
"sum += texture2D(samplerFront, vTex - vec2(0.0, pixelHeight * 7.0 + halfPixelHeight)) * 0.06;",
"sum += texture2D(samplerFront, vTex - vec2(0.0, pixelHeight * 5.0 + halfPixelHeight)) * 0.10;",
"sum += texture2D(samplerFront, vTex - vec2(0.0, pixelHeight * 3.0 + halfPixelHeight)) * 0.13;",
"sum += texture2D(samplerFront, vTex - vec2(0.0, pixelHeight * 1.0 + halfPixelHeight)) * 0.16;",
"mediump vec4 front = texture2D(samplerFront, vTex);",
"sum += front * 0.10;",
"sum += texture2D(samplerFront, vTex + vec2(0.0, pixelHeight * 1.0 + halfPixelHeight)) * 0.16;",
"sum += texture2D(samplerFront, vTex + vec2(0.0, pixelHeight * 3.0 + halfPixelHeight)) * 0.13;",
"sum += texture2D(samplerFront, vTex + vec2(0.0, pixelHeight * 5.0 + halfPixelHeight)) * 0.10;",
"sum += texture2D(samplerFront, vTex + vec2(0.0, pixelHeight * 7.0 + halfPixelHeight)) * 0.06;",
"gl_FragColor = mix(front, max(front, sum), intensity);",
"}"
].join("\n"),
	extendBoxHorizontal: 0,
	extendBoxVertical: 8,
	crossSampling: false,
	animated: false,
	parameters: [["intensity", 0, 1]] }
cr.shaders["hardlight"] = {src: ["varying mediump vec2 vTex;",
"uniform lowp sampler2D samplerFront;",
"uniform lowp sampler2D samplerBack;",
"uniform mediump vec2 destStart;",
"uniform mediump vec2 destEnd;",
"void main(void)",
"{",
"lowp vec4 front = texture2D(samplerFront, vTex);",
"lowp vec4 back = texture2D(samplerBack, mix(destStart, destEnd, vTex));",
"if (front.r * 0.299 + front.g * 0.587 + front.b * 0.114 <= 0.5)",
"{",
"front *= back * 2.0;",
"}",
"else",
"{",
"front.rgb = 1.0 - ((1.0 - (2.0 * front.rgb - 1.0)) * (1.0 - back.rgb * front.a));",
"}",
"gl_FragColor = front;",
"}"
].join("\n"),
	extendBoxHorizontal: 0,
	extendBoxVertical: 0,
	crossSampling: false,
	animated: false,
	parameters: [] }
;
;
cr.plugins_.AJAX = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var isNodeWebkit = false;
	var path = null;
	var fs = null;
	var nw_appfolder = "";
	var pluginProto = cr.plugins_.AJAX.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.lastData = "";
		this.curTag = "";
		this.progress = 0;
		isNodeWebkit = this.runtime.isNodeWebkit;
		if (isNodeWebkit)
		{
			path = require("path");
			fs = require("fs");
			nw_appfolder = path["dirname"](process["execPath"]) + "\\";
		}
	};
	var instanceProto = pluginProto.Instance.prototype;
	var theInstance = null;
	window["C2_AJAX_DCSide"] = function (event_, tag_, param_)
	{
		if (!theInstance)
			return;
		if (event_ === "success")
		{
			theInstance.curTag = tag_;
			theInstance.lastData = param_;
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, theInstance);
		}
		else if (event_ === "error")
		{
			theInstance.curTag = tag_;
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, theInstance);
		}
		else if (event_ === "progress")
		{
			theInstance.progress = param_;
			theInstance.curTag = tag_;
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnProgress, theInstance);
		}
	};
	instanceProto.onCreate = function()
	{
		theInstance = this;
	};
	instanceProto.saveToJSON = function ()
	{
		return { "lastData": this.lastData };
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.lastData = o["lastData"];
		this.curTag = "";
		this.progress = 0;
	};
	instanceProto.doRequest = function (tag_, url_, method_, data_)
	{
		if (this.runtime.isDirectCanvas)
		{
			AppMobi["webview"]["execute"]('C2_AJAX_WebSide("' + tag_ + '", "' + url_ + '", "' + method_ + '", ' + (data_ ? '"' + data_ + '"' : "null") + ');');
			return;
		}
		var self = this;
		var request = null;
		var doErrorFunc = function ()
		{
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, self);
		};
		var errorFunc = function ()
		{
			if (isNodeWebkit)
			{
				var filepath = nw_appfolder + url_;
				if (fs["existsSync"](filepath))
				{
					fs["readFile"](filepath, {"encoding": "utf8"}, function (err, data) {
						if (err)
						{
							doErrorFunc();
							return;
						}
						self.lastData = data.replace(/\r\n/g, "\n")
						self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, self);
					});
				}
				else
					doErrorFunc();
			}
			else
				doErrorFunc();
		};
		var progressFunc = function (e)
		{
			if (!e["lengthComputable"])
				return;
			self.progress = e.loaded / e.total;
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnProgress, self);
		};
		try
		{
			request = new XMLHttpRequest();
			request.onreadystatechange = function() {
				if (request.readyState === 4 && (isNodeWebkit || request.status !== 0))
				{
					self.curTag = tag_;
					if (request.status >= 400)
						self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, self);
					else
					{
						self.lastData = request.responseText.replace(/\r\n/g, "\n");		// fix windows style line endings
						if (!isNodeWebkit || self.lastData.length)
							self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, self);
					}
				}
			};
			request.onerror = errorFunc;
			request.ontimeout = errorFunc;
			request.onabort = errorFunc;
			request["onprogress"] = progressFunc;
			request.open(method_, url_);
			try {
				request.responseType = "text";
			} catch (e) {}
			if (method_ === "POST" && data_)
			{
				if (request["setRequestHeader"])
				{
					request["setRequestHeader"]("Content-Type", "application/x-www-form-urlencoded");
					request["setRequestHeader"]("Content-Length", data_.length);
				}
				request.send(data_);
			}
			else
				request.send();
		}
		catch (e)
		{
			errorFunc();
		}
	};
	function Cnds() {};
	Cnds.prototype.OnComplete = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
	Cnds.prototype.OnError = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
	Cnds.prototype.OnProgress = function (tag)
	{
		return cr.equals_nocase(tag, this.curTag);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Request = function (tag_, url_)
	{
		this.doRequest(tag_, url_, "GET");
	};
	Acts.prototype.RequestFile = function (tag_, file_)
	{
		this.doRequest(tag_, file_, "GET");
	};
	Acts.prototype.Post = function (tag_, url_, data_)
	{
		this.doRequest(tag_, url_, "POST", data_);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.LastData = function (ret)
	{
		ret.set_string(this.lastData);
	};
	Exps.prototype.Progress = function (ret)
	{
		ret.set_float(this.progress);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Audio = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Audio.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	var audRuntime = null;
	var audInst = null;
	var audTag = "";
	var appPath = "";			// for PhoneGap only
	var API_HTML5 = 0;
	var API_WEBAUDIO = 1;
	var API_PHONEGAP = 2;
	var API_APPMOBI = 3;
	var api = API_HTML5;
	var context = null;
	var audioBuffers = [];		// cache of buffers
	var audioInstances = [];	// cache of instances
	var lastAudio = null;
	var useOgg = false;			// determined at create time
	var timescale_mode = 0;
	var silent = false;
	var masterVolume = 1;
	var listenerX = 0;
	var listenerY = 0;
	var panningModel = 1;		// HRTF
	var distanceModel = 1;		// Inverse
	var refDistance = 10;
	var maxDistance = 10000;
	var rolloffFactor = 1;
	var micSource = null;
	var micTag = "";
	function dbToLinear(x)
	{
		var v = dbToLinear_nocap(x);
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		return v;
	};
	function linearToDb(x)
	{
		if (x < 0)
			x = 0;
		if (x > 1)
			x = 1;
		return linearToDb_nocap(x);
	};
	function dbToLinear_nocap(x)
	{
		return Math.pow(10, x / 20);
	};
	function linearToDb_nocap(x)
	{
		return (Math.log(x) / Math.log(10)) * 20;
	};
	var effects = {};
	function getDestinationForTag(tag)
	{
		tag = tag.toLowerCase();
		if (effects.hasOwnProperty(tag))
		{
			if (effects[tag].length)
				return effects[tag][0].getInputNode();
		}
		return context["destination"];
	};
	function createGain()
	{
		if (context["createGain"])
			return context["createGain"]();
		else
			return context["createGainNode"]();
	};
	function createDelay(d)
	{
		if (context["createDelay"])
			return context["createDelay"](d);
		else
			return context["createDelayNode"](d);
	};
	function startSource(s)
	{
		if (s["start"])
			s["start"](0);
		else
			s["noteOn"](0);
	};
	function startSourceAt(s, x, d)
	{
		if (s["start"])
			s["start"](0, x);
		else
			s["noteGrainOn"](0, x, d - x);
	};
	function stopSource(s)
	{
		if (s["stop"])
			s["stop"](0);
		else
			s["noteOff"](0);
	};
	function setAudioParam(ap, value, ramp, time)
	{
		if (!ap)
			return;		// iOS is missing some parameters
		ap["cancelScheduledValues"](0);
		if (time === 0)
		{
			ap["value"] = value;
			return;
		}
		var curTime = context["currentTime"];
		time += curTime;
		switch (ramp) {
		case 0:		// step
			ap["setValueAtTime"](value, time);
			break;
		case 1:		// linear
			ap["setValueAtTime"](ap["value"], curTime);		// to set what to ramp from
			ap["linearRampToValueAtTime"](value, time);
			break;
		case 2:		// exponential
			ap["setValueAtTime"](ap["value"], curTime);		// to set what to ramp from
			ap["exponentialRampToValueAtTime"](value, time);
			break;
		}
	};
	var filterTypes = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"];
	function FilterEffect(type, freq, detune, q, gain, mix)
	{
		this.type = "filter";
		this.params = [type, freq, detune, q, gain, mix];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.filterNode = context["createBiquadFilter"]();
		if (typeof this.filterNode["type"] === "number")
			this.filterNode["type"] = type;
		else
			this.filterNode["type"] = filterTypes[type];
		this.filterNode["frequency"]["value"] = freq;
		if (this.filterNode["detune"])		// iOS 6 doesn't have detune yet
			this.filterNode["detune"]["value"] = detune;
		this.filterNode["Q"]["value"] = q;
		this.filterNode["gain"]["value"] = gain;
		this.inputNode["connect"](this.filterNode);
		this.inputNode["connect"](this.dryNode);
		this.filterNode["connect"](this.wetNode);
	};
	FilterEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	FilterEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.filterNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	FilterEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	FilterEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 1:		// filter frequency
			this.params[0] = value;
			setAudioParam(this.filterNode["frequency"], value, ramp, time);
			break;
		case 2:		// filter detune
			this.params[1] = value;
			setAudioParam(this.filterNode["detune"], value, ramp, time);
			break;
		case 3:		// filter Q
			this.params[2] = value;
			setAudioParam(this.filterNode["Q"], value, ramp, time);
			break;
		case 4:		// filter/delay gain (note value is in dB here)
			this.params[3] = value;
			setAudioParam(this.filterNode["gain"], value, ramp, time);
			break;
		}
	};
	function DelayEffect(delayTime, delayGain, mix)
	{
		this.type = "delay";
		this.params = [delayTime, delayGain, mix];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.mainNode = createGain();
		this.delayNode = createDelay(delayTime);
		this.delayNode["delayTime"]["value"] = delayTime;
		this.delayGainNode = createGain();
		this.delayGainNode["gain"]["value"] = delayGain;
		this.inputNode["connect"](this.mainNode);
		this.inputNode["connect"](this.dryNode);
		this.mainNode["connect"](this.wetNode);
		this.mainNode["connect"](this.delayNode);
		this.delayNode["connect"](this.delayGainNode);
		this.delayGainNode["connect"](this.mainNode);
	};
	DelayEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	DelayEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.mainNode["disconnect"]();
		this.delayNode["disconnect"]();
		this.delayGainNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	DelayEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	DelayEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[2] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 4:		// filter/delay gain (note value is passed in dB but needs to be linear here)
			this.params[1] = dbToLinear(value);
			setAudioParam(this.delayGainNode["gain"], dbToLinear(value), ramp, time);
			break;
		case 5:		// delay time
			this.params[0] = value;
			setAudioParam(this.delayNode["delayTime"], value, ramp, time);
			break;
		}
	};
	function ConvolveEffect(buffer, normalize, mix, src)
	{
		this.type = "convolve";
		this.params = [normalize, mix, src];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.convolveNode = context["createConvolver"]();
		if (buffer)
		{
			this.convolveNode["normalize"] = normalize;
			this.convolveNode["buffer"] = buffer;
		}
		this.inputNode["connect"](this.convolveNode);
		this.inputNode["connect"](this.dryNode);
		this.convolveNode["connect"](this.wetNode);
	};
	ConvolveEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	ConvolveEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.convolveNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	ConvolveEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	ConvolveEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		}
	};
	function FlangerEffect(delay, modulation, freq, feedback, mix)
	{
		this.type = "flanger";
		this.params = [delay, modulation, freq, feedback, mix];
		this.inputNode = createGain();
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - (mix / 2);
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix / 2;
		this.feedbackNode = createGain();
		this.feedbackNode["gain"]["value"] = feedback;
		this.delayNode = createDelay(delay + modulation);
		this.delayNode["delayTime"]["value"] = delay;
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = modulation;
		this.inputNode["connect"](this.delayNode);
		this.inputNode["connect"](this.dryNode);
		this.delayNode["connect"](this.wetNode);
		this.delayNode["connect"](this.feedbackNode);
		this.feedbackNode["connect"](this.delayNode);
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.delayNode["delayTime"]);
		startSource(this.oscNode);
	};
	FlangerEffect.prototype.connectTo = function (node)
	{
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
	};
	FlangerEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.delayNode["disconnect"]();
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.dryNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.feedbackNode["disconnect"]();
	};
	FlangerEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	FlangerEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			setAudioParam(this.wetNode["gain"], value / 2, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - (value / 2), ramp, time);
			break;
		case 6:		// modulation
			this.params[1] = value / 1000;
			setAudioParam(this.oscGainNode["gain"], value / 1000, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[2] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		case 8:		// feedback
			this.params[3] = value / 100;
			setAudioParam(this.feedbackNode["gain"], value / 100, ramp, time);
			break;
		}
	};
	function PhaserEffect(freq, detune, q, modulation, modfreq, mix)
	{
		this.type = "phaser";
		this.params = [freq, detune, q, modulation, modfreq, mix];
		this.inputNode = createGain();
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - (mix / 2);
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix / 2;
		this.filterNode = context["createBiquadFilter"]();
		if (typeof this.filterNode["type"] === "number")
			this.filterNode["type"] = 7;	// all-pass
		else
			this.filterNode["type"] = "allpass";
		this.filterNode["frequency"]["value"] = freq;
		if (this.filterNode["detune"])		// iOS 6 doesn't have detune yet
			this.filterNode["detune"]["value"] = detune;
		this.filterNode["Q"]["value"] = q;
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = modfreq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = modulation;
		this.inputNode["connect"](this.filterNode);
		this.inputNode["connect"](this.dryNode);
		this.filterNode["connect"](this.wetNode);
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.filterNode["frequency"]);
		startSource(this.oscNode);
	};
	PhaserEffect.prototype.connectTo = function (node)
	{
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
	};
	PhaserEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.filterNode["disconnect"]();
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.dryNode["disconnect"]();
		this.wetNode["disconnect"]();
	};
	PhaserEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	PhaserEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[5] = value;
			setAudioParam(this.wetNode["gain"], value / 2, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - (value / 2), ramp, time);
			break;
		case 1:		// filter frequency
			this.params[0] = value;
			setAudioParam(this.filterNode["frequency"], value, ramp, time);
			break;
		case 2:		// filter detune
			this.params[1] = value;
			setAudioParam(this.filterNode["detune"], value, ramp, time);
			break;
		case 3:		// filter Q
			this.params[2] = value;
			setAudioParam(this.filterNode["Q"], value, ramp, time);
			break;
		case 6:		// modulation
			this.params[3] = value;
			setAudioParam(this.oscGainNode["gain"], value, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[4] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	function GainEffect(g)
	{
		this.type = "gain";
		this.params = [g];
		this.node = createGain();
		this.node["gain"]["value"] = g;
	};
	GainEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	GainEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	GainEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	GainEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 4:		// gain
			this.params[0] = dbToLinear(value);
			setAudioParam(this.node["gain"], dbToLinear(value), ramp, time);
			break;
		}
	};
	function TremoloEffect(freq, mix)
	{
		this.type = "tremolo";
		this.params = [freq, mix];
		this.node = createGain();
		this.node["gain"]["value"] = 1 - (mix / 2);
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = mix / 2;
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.node["gain"]);
		startSource(this.oscNode);
	};
	TremoloEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	TremoloEffect.prototype.remove = function ()
	{
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.node["disconnect"]();
	};
	TremoloEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	TremoloEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.node["gain"]["value"], 1 - (value / 2), ramp, time);
			setAudioParam(this.oscGainNode["gain"]["value"], value / 2, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[0] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	function RingModulatorEffect(freq, mix)
	{
		this.type = "ringmod";
		this.params = [freq, mix];
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.ringNode = createGain();
		this.ringNode["gain"]["value"] = 0;
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscNode["connect"](this.ringNode["gain"]);
		startSource(this.oscNode);
		this.inputNode["connect"](this.ringNode);
		this.inputNode["connect"](this.dryNode);
		this.ringNode["connect"](this.wetNode);
	};
	RingModulatorEffect.prototype.connectTo = function (node_)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node_);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node_);
	};
	RingModulatorEffect.prototype.remove = function ()
	{
		this.oscNode["disconnect"]();
		this.ringNode["disconnect"]();
		this.inputNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	RingModulatorEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	RingModulatorEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[0] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	function DistortionEffect(threshold, headroom, drive, makeupgain, mix)
	{
		this.type = "distortion";
		this.params = [threshold, headroom, drive, makeupgain, mix];
		this.inputNode = createGain();
		this.preGain = createGain();
		this.postGain = createGain();
		this.setDrive(drive, dbToLinear_nocap(makeupgain));
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.waveShaper = context["createWaveShaper"]();
		this.curve = new Float32Array(65536);
		this.generateColortouchCurve(threshold, headroom);
		this.waveShaper.curve = this.curve;
		this.inputNode["connect"](this.preGain);
		this.inputNode["connect"](this.dryNode);
		this.preGain["connect"](this.waveShaper);
		this.waveShaper["connect"](this.postGain);
		this.postGain["connect"](this.wetNode);
	};
	DistortionEffect.prototype.setDrive = function (drive, makeupgain)
	{
		if (drive < 0.01)
			drive = 0.01;
		this.preGain["gain"]["value"] = drive;
		this.postGain["gain"]["value"] = Math.pow(1 / drive, 0.6) * makeupgain;
	};
	function e4(x, k)
	{
		return 1.0 - Math.exp(-k * x);
	}
	DistortionEffect.prototype.shape = function (x, linearThreshold, linearHeadroom)
	{
		var maximum = 1.05 * linearHeadroom * linearThreshold;
		var kk = (maximum - linearThreshold);
		var sign = x < 0 ? -1 : +1;
		var absx = x < 0 ? -x : x;
		var shapedInput = absx < linearThreshold ? absx : linearThreshold + kk * e4(absx - linearThreshold, 1.0 / kk);
		shapedInput *= sign;
		return shapedInput;
	};
	DistortionEffect.prototype.generateColortouchCurve = function (threshold, headroom)
	{
		var linearThreshold = dbToLinear_nocap(threshold);
		var linearHeadroom = dbToLinear_nocap(headroom);
		var n = 65536;
		var n2 = n / 2;
		var x = 0;
		for (var i = 0; i < n2; ++i) {
			x = i / n2;
			x = this.shape(x, linearThreshold, linearHeadroom);
			this.curve[n2 + i] = x;
			this.curve[n2 - i - 1] = -x;
		}
	};
	DistortionEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	DistortionEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.preGain["disconnect"]();
		this.waveShaper["disconnect"]();
		this.postGain["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	DistortionEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	DistortionEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		}
	};
	function CompressorEffect(threshold, knee, ratio, attack, release)
	{
		this.type = "compressor";
		this.params = [threshold, knee, ratio, attack, release];
		this.node = context["createDynamicsCompressor"]();
		this.node["threshold"]["value"] = threshold;
		this.node["knee"]["value"] = knee;
		this.node["ratio"]["value"] = ratio;
		this.node["attack"]["value"] = attack;
		this.node["release"]["value"] = release;
	};
	CompressorEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	CompressorEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	CompressorEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	CompressorEffect.prototype.setParam = function(param, value, ramp, time)
	{
	};
	function AnalyserEffect(fftSize, smoothing)
	{
		this.type = "analyser";
		this.params = [fftSize, smoothing];
		this.node = context["createAnalyser"]();
		this.node["fftSize"] = fftSize;
		this.node["smoothingTimeConstant"] = smoothing;
		this.freqBins = new Float32Array(this.node["frequencyBinCount"]);
		this.signal = new Uint8Array(fftSize);
		this.peak = 0;
		this.rms = 0;
	};
	AnalyserEffect.prototype.tick = function ()
	{
		this.node["getFloatFrequencyData"](this.freqBins);
		this.node["getByteTimeDomainData"](this.signal);
		var fftSize = this.node["fftSize"];
		var i = 0;
		this.peak = 0;
		var rmsSquaredSum = 0;
		var s = 0;
		for ( ; i < fftSize; i++)
		{
			s = (this.signal[i] - 128) / 128;
			if (s < 0)
				s = -s;
			if (this.peak < s)
				this.peak = s;
			rmsSquaredSum += s * s;
		}
		this.peak = linearToDb(this.peak);
		this.rms = linearToDb(Math.sqrt(rmsSquaredSum / fftSize));
	};
	AnalyserEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	AnalyserEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	AnalyserEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	AnalyserEffect.prototype.setParam = function(param, value, ramp, time)
	{
	};
	var OT_POS_SAMPLES = 4;
	function ObjectTracker()
	{
		this.obj = null;
		this.loadUid = 0;
		this.speeds = [];
		this.lastX = 0;
		this.lastY = 0;
		this.moveAngle = 0;
	};
	ObjectTracker.prototype.setObject = function (obj_)
	{
		this.obj = obj_;
		if (this.obj)
		{
			this.lastX = this.obj.x;
			this.lastY = this.obj.y;
		}
		this.speeds.length = 0;
	};
	ObjectTracker.prototype.hasObject = function ()
	{
		return !!this.obj;
	};
	ObjectTracker.prototype.tick = function (dt)
	{
		if (!this.obj)
			return;
		this.moveAngle = cr.angleTo(this.lastX, this.lastY, this.obj.x, this.obj.y);
		var s = cr.distanceTo(this.lastX, this.lastY, this.obj.x, this.obj.y) / dt;
		if (this.speeds.length < OT_POS_SAMPLES)
			this.speeds.push(s);
		else
		{
			this.speeds.shift();
			this.speeds.push(s);
		}
		this.lastX = this.obj.x;
		this.lastY = this.obj.y;
	};
	ObjectTracker.prototype.getSpeed = function ()
	{
		if (!this.speeds.length)
			return 0;
		var i, len, sum = 0;
		for (i = 0, len = this.speeds.length; i < len; i++)
		{
			sum += this.speeds[i];
		}
		return sum / this.speeds.length;
	};
	ObjectTracker.prototype.getVelocityX = function ()
	{
		return Math.cos(this.moveAngle) * this.getSpeed();
	};
	ObjectTracker.prototype.getVelocityY = function ()
	{
		return Math.sin(this.moveAngle) * this.getSpeed();
	};
	var iOShadtouch = false;	// has had touch input on iOS to work around web audio API muting
	function C2AudioBuffer(src_, is_music)
	{
		this.src = src_;
		this.myapi = api;
		this.is_music = is_music;
		this.added_end_listener = false;
		var self = this;
		this.outNode = null;
		this.mediaSourceNode = null;
		this.panWhenReady = [];		// for web audio API positioned sounds
		this.seekWhenReady = 0;
		this.pauseWhenReady = false;
		if (api === API_WEBAUDIO && is_music && !audRuntime.isMobile)
		{
			this.myapi = API_HTML5;
			this.outNode = createGain();
		}
		this.bufferObject = null;			// actual audio object
		this.audioData = null;				// web audio api: ajax request result (compressed audio that needs decoding)
		var request;
		switch (this.myapi) {
		case API_HTML5:
			this.bufferObject = new Audio();
			if (api === API_WEBAUDIO && context["createMediaElementSource"])
			{
				this.bufferObject.addEventListener("canplay", function ()
				{
					self.mediaSourceNode = context["createMediaElementSource"](self.bufferObject);
					self.mediaSourceNode["connect"](self.outNode);
				});
			}
			this.bufferObject.autoplay = false;	// this is only a source buffer, not an instance
			this.bufferObject.preload = "auto";
			this.bufferObject.src = src_;
			break;
		case API_WEBAUDIO:
			request = new XMLHttpRequest();
			request.open("GET", src_, true);
			request.responseType = "arraybuffer";
			request.onload = function () {
				self.audioData = request.response;
				self.decodeAudioBuffer();
			};
			request.send();
			break;
		case API_PHONEGAP:
			this.bufferObject = true;
			break;
		case API_APPMOBI:
			this.bufferObject = true;
			break;
		}
	};
	C2AudioBuffer.prototype.decodeAudioBuffer = function ()
	{
		if (this.bufferObject || !this.audioData)
			return;		// audio already decoded or AJAX request not yet complete
		var self = this;
		if (context["decodeAudioData"])
		{
			context["decodeAudioData"](this.audioData, function (buffer) {
					self.bufferObject = buffer;
					var p, i, len, a;
					if (!cr.is_undefined(self.playTagWhenReady))
					{
						if (self.panWhenReady.length)
						{
							for (i = 0, len = self.panWhenReady.length; i < len; i++)
							{
								p = self.panWhenReady[i];
								a = new C2AudioInstance(self, p.thistag);
								a.setPannerEnabled(true);
								if (typeof p.objUid !== "undefined")
								{
									p.obj = audRuntime.getObjectByUID(p.objUid);
									if (!p.obj)
										continue;
								}
								if (p.obj)
								{
									var px = cr.rotatePtAround(p.obj.x, p.obj.y, -p.obj.layer.getAngle(), listenerX, listenerY, true);
									var py = cr.rotatePtAround(p.obj.x, p.obj.y, -p.obj.layer.getAngle(), listenerX, listenerY, false);
									a.setPan(px, py, cr.to_degrees(p.obj.angle - p.obj.layer.getAngle()), p.ia, p.oa, p.og);
									a.setObject(p.obj);
								}
								else
								{
									a.setPan(p.x, p.y, p.a, p.ia, p.oa, p.og);
								}
								a.play(self.loopWhenReady, self.volumeWhenReady, self.seekWhenReady);
								if (self.pauseWhenReady)
									a.pause();
								audioInstances.push(a);
							}
							self.panWhenReady.length = 0;
						}
						else
						{
							a = new C2AudioInstance(self, self.playTagWhenReady);
							a.play(self.loopWhenReady, self.volumeWhenReady, self.seekWhenReady);
							if (self.pauseWhenReady)
								a.pause();
							audioInstances.push(a);
						}
					}
					else if (!cr.is_undefined(self.convolveWhenReady))
					{
						var convolveNode = self.convolveWhenReady.convolveNode;
						convolveNode["normalize"] = self.normalizeWhenReady;
						convolveNode["buffer"] = buffer;
					}
			});
		}
		else
		{
			this.bufferObject = context["createBuffer"](this.audioData, false);
			if (!cr.is_undefined(this.playTagWhenReady))
			{
				var a = new C2AudioInstance(this, this.playTagWhenReady);
				a.play(this.loopWhenReady, this.volumeWhenReady, this.seekWhenReady);
				if (this.pauseWhenReady)
					a.pause();
				audioInstances.push(a);
			}
			else if (!cr.is_undefined(this.convolveWhenReady))
			{
				var convolveNode = this.convolveWhenReady.convolveNode;
				convolveNode["normalize"] = this.normalizeWhenReady;
				convolveNode["buffer"] = this.bufferObject;
			}
		}
	};
	C2AudioBuffer.prototype.isLoaded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.bufferObject["readyState"] === 4;	// HAVE_ENOUGH_DATA
		case API_WEBAUDIO:
			return !!this.audioData;			// null until AJAX request completes
		case API_PHONEGAP:
			return true;
		case API_APPMOBI:
			return true;
		}
		return false;
	};
	function C2AudioInstance(buffer_, tag_)
	{
		var self = this;
		this.tag = tag_;
		this.fresh = true;
		this.stopped = true;
		this.src = buffer_.src;
		this.buffer = buffer_;
		this.myapi = api;
		this.is_music = buffer_.is_music;
		this.playbackRate = 1;
		this.pgended = true;			// for PhoneGap only: ended flag
		this.resume_me = false;			// make sure resumes when leaving suspend
		this.is_paused = false;
		this.resume_position = 0;		// for web audio api to resume from correct playback position
		this.looping = false;
		this.is_muted = false;
		this.is_silent = false;
		this.volume = 1;
		this.mutevol = 1;
		this.startTime = audRuntime.kahanTime.sum;
		this.gainNode = null;
		this.pannerNode = null;
		this.pannerEnabled = false;
		this.objectTracker = null;
		this.panX = 0;
		this.panY = 0;
		this.panAngle = 0;
		this.panConeInner = 0;
		this.panConeOuter = 0;
		this.panConeOuterGain = 0;
		this.instanceObject = null;
		var add_end_listener = false;
		switch (this.myapi) {
		case API_HTML5:
			if (this.is_music)
			{
				this.instanceObject = buffer_.bufferObject;
				add_end_listener = !buffer_.added_end_listener;
				buffer_.added_end_listener = true;
			}
			else
			{
				this.instanceObject = new Audio();
				this.instanceObject.autoplay = false;
				this.instanceObject.src = buffer_.bufferObject.src;
				add_end_listener = true;
			}
			if (add_end_listener)
			{
				this.instanceObject.addEventListener('ended', function () {
						audTag = self.tag;
						self.stopped = true;
						audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
				});
			}
			break;
		case API_WEBAUDIO:
			this.gainNode = createGain();
			this.gainNode["connect"](getDestinationForTag(tag_));
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (buffer_.bufferObject)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = buffer_.bufferObject;
					this.instanceObject["connect"](this.gainNode);
				}
			}
			else
			{
				this.instanceObject = this.buffer.bufferObject;		// reference the audio element
				this.buffer.outNode["connect"](this.gainNode);
			}
			break;
		case API_PHONEGAP:
			this.instanceObject = new window["Media"](appPath + this.src, null, null, function (status) {
					if (status === window["Media"]["MEDIA_STOPPED"])
					{
						self.pgended = true;
						self.stopped = true;
						audTag = self.tag;
						audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
					}
			});
			break;
		case API_APPMOBI:
			this.instanceObject = true;
			break;
		}
	};
	C2AudioInstance.prototype.hasEnded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.instanceObject.ended;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (!this.fresh && !this.stopped && this.instanceObject["loop"])
					return false;
				if (this.is_paused)
					return false;
				return (audRuntime.kahanTime.sum - this.startTime) > this.buffer.bufferObject["duration"];
			}
			else
				return this.instanceObject.ended;
		case API_PHONEGAP:
			return this.pgended;
		case API_APPMOBI:
			true;	// recycling an AppMobi sound does not matter because it will just do another throwaway playSound
		}
		return true;
	};
	C2AudioInstance.prototype.canBeRecycled = function ()
	{
		if (this.fresh || this.stopped)
			return true;		// not yet used or is not playing
		return this.hasEnded();
	};
	C2AudioInstance.prototype.setPannerEnabled = function (enable_)
	{
		if (api !== API_WEBAUDIO)
			return;
		if (!this.pannerEnabled && enable_)
		{
			if (!this.pannerNode)
			{
				this.pannerNode = context["createPanner"]();
				if (typeof this.pannerNode["panningModel"] === "number")
					this.pannerNode["panningModel"] = panningModel;
				else
					this.pannerNode["panningModel"] = ["equalpower", "HRTF", "soundfield"][panningModel];
				if (typeof this.pannerNode["distanceModel"] === "number")
					this.pannerNode["distanceModel"] = distanceModel;
				else
					this.pannerNode["distanceModel"] = ["linear", "inverse", "exponential"][distanceModel];
				this.pannerNode["refDistance"] = refDistance;
				this.pannerNode["maxDistance"] = maxDistance;
				this.pannerNode["rolloffFactor"] = rolloffFactor;
			}
			this.gainNode["disconnect"]();
			this.gainNode["connect"](this.pannerNode);
			this.pannerNode["connect"](getDestinationForTag(this.tag));
			this.pannerEnabled = true;
		}
		else if (this.pannerEnabled && !enable_)
		{
			this.pannerNode["disconnect"]();
			this.gainNode["disconnect"]();
			this.gainNode["connect"](getDestinationForTag(this.tag));
			this.pannerEnabled = false;
		}
	};
	C2AudioInstance.prototype.setPan = function (x, y, angle, innerangle, outerangle, outergain)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO)
			return;
		this.pannerNode["setPosition"](x, y, 0);
		this.pannerNode["setOrientation"](Math.cos(cr.to_radians(angle)), Math.sin(cr.to_radians(angle)), 0);
		this.pannerNode["coneInnerAngle"] = innerangle;
		this.pannerNode["coneOuterAngle"] = outerangle;
		this.pannerNode["coneOuterGain"] = outergain;
		this.panX = x;
		this.panY = y;
		this.panAngle = angle;
		this.panConeInner = innerangle;
		this.panConeOuter = outerangle;
		this.panConeOuterGain = outergain;
	};
	C2AudioInstance.prototype.setObject = function (o)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO)
			return;
		if (!this.objectTracker)
			this.objectTracker = new ObjectTracker();
		this.objectTracker.setObject(o);
	};
	C2AudioInstance.prototype.tick = function (dt)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO || !this.objectTracker || !this.objectTracker.hasObject() || !this.isPlaying())
		{
			return;
		}
		this.objectTracker.tick(dt);
		var inst = this.objectTracker.obj;
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		this.pannerNode["setPosition"](px, py, 0);
		var a = 0;
		if (typeof this.objectTracker.obj.angle !== "undefined")
		{
			a = inst.angle - inst.layer.getAngle();
			this.pannerNode["setOrientation"](Math.cos(a), Math.sin(a), 0);
		}
		this.pannerNode["setVelocity"](this.objectTracker.getVelocityX(), this.objectTracker.getVelocityY(), 0);
	};
	C2AudioInstance.prototype.play = function (looping, vol, fromPosition)
	{
		var instobj = this.instanceObject;
		this.looping = looping;
		this.volume = vol;
		var seekPos = fromPosition || 0;
		switch (this.myapi) {
		case API_HTML5:
			if (instobj.playbackRate !== 1.0)
				instobj.playbackRate = 1.0;
			if (instobj.volume !== vol * masterVolume)
				instobj.volume = vol * masterVolume;
			if (instobj.loop !== looping)
				instobj.loop = looping;
			if (instobj.muted)
				instobj.muted = false;
			if (instobj.currentTime !== seekPos)
			{
				try {
					instobj.currentTime = seekPos;
				}
				catch (err)
				{
;
				}
			}
			this.instanceObject.play();
			break;
		case API_WEBAUDIO:
			this.muted = false;
			this.mutevol = 1;
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (!this.fresh)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = this.buffer.bufferObject;
					this.instanceObject["connect"](this.gainNode);
				}
				this.instanceObject.loop = looping;
				this.gainNode["gain"]["value"] = vol * masterVolume;
				if (seekPos === 0)
					startSource(this.instanceObject);
				else
					startSourceAt(this.instanceObject, seekPos, this.getDuration());
			}
			else
			{
				if (instobj.playbackRate !== 1.0)
					instobj.playbackRate = 1.0;
				if (instobj.loop !== looping)
					instobj.loop = looping;
				this.gainNode["gain"]["value"] = vol * masterVolume;
				if (instobj.currentTime !== seekPos)
				{
					try {
						instobj.currentTime = seekPos;
					}
					catch (err)
					{
;
					}
				}
				instobj.play();
			}
			break;
		case API_PHONEGAP:
			if ((!this.fresh && this.stopped) || seekPos !== 0)
				instobj["seekTo"](seekPos);
			instobj["play"]();
			this.pgended = false;
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["playSound"](this.src);
			else
				AppMobi["player"]["playSound"](this.src);
			break;
		}
		this.playbackRate = 1;
		this.startTime = audRuntime.kahanTime.sum - seekPos;
		this.fresh = false;
		this.stopped = false;
		this.is_paused = false;
	};
	C2AudioInstance.prototype.stop = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
				stopSource(this.instanceObject);
			else
			{
				if (!this.instanceObject.paused)
					this.instanceObject.pause();
			}
			break;
		case API_PHONEGAP:
			this.instanceObject["stop"]();
			break;
		case API_APPMOBI:
			break;
		}
		this.stopped = true;
		this.is_paused = false;
	};
	C2AudioInstance.prototype.pause = function ()
	{
		if (this.fresh || this.stopped || this.hasEnded() || this.is_paused)
			return;
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.resume_position = this.getPlaybackTime();
				if (this.looping)
					this.resume_position = this.resume_position % this.getDuration();
				stopSource(this.instanceObject);
			}
			else
			{
				if (!this.instanceObject.paused)
					this.instanceObject.pause();
			}
			break;
		case API_PHONEGAP:
			this.instanceObject["pause"]();
			break;
		case API_APPMOBI:
			break;
		}
		this.is_paused = true;
	};
	C2AudioInstance.prototype.resume = function ()
	{
		if (this.fresh || this.stopped || this.hasEnded() || !this.is_paused)
			return;
		switch (this.myapi) {
		case API_HTML5:
			this.instanceObject.play();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.instanceObject = context["createBufferSource"]();
				this.instanceObject["buffer"] = this.buffer.bufferObject;
				this.instanceObject["connect"](this.gainNode);
				this.instanceObject.loop = this.looping;
				this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
				this.startTime = audRuntime.kahanTime.sum - this.resume_position;
				startSourceAt(this.instanceObject, this.resume_position, this.getDuration());
			}
			else
			{
				this.instanceObject.play();
			}
			break;
		case API_PHONEGAP:
			this.instanceObject["play"]();
			break;
		case API_APPMOBI:
			break;
		}
		this.is_paused = false;
	};
	C2AudioInstance.prototype.seek = function (pos)
	{
		if (this.fresh || this.stopped || this.hasEnded())
			return;
		switch (this.myapi) {
		case API_HTML5:
			try {
				this.instanceObject.currentTime = pos;
			}
			catch (e) {}
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.is_paused)
					this.resume_position = pos;
				else
				{
					this.pause();
					this.resume_position = pos;
					this.resume();
				}
			}
			else
			{
				try {
					this.instanceObject.currentTime = pos;
				}
				catch (e) {}
			}
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.reconnect = function (toNode)
	{
		if (this.myapi !== API_WEBAUDIO)
			return;
		if (this.pannerEnabled)
		{
			this.pannerNode["disconnect"]();
			this.pannerNode["connect"](toNode);
		}
		else
		{
			this.gainNode["disconnect"]();
			this.gainNode["connect"](toNode);
		}
	};
	C2AudioInstance.prototype.getDuration = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			if (typeof this.instanceObject.duration !== "undefined")
				return this.instanceObject.duration;
			else
				return 0;
		case API_WEBAUDIO:
			return this.buffer.bufferObject["duration"];
		case API_PHONEGAP:
			return this.instanceObject["getDuration"]();
		case API_APPMOBI:
			return 0;
		}
		return 0;
	};
	C2AudioInstance.prototype.getPlaybackTime = function ()
	{
		var duration = this.getDuration();
		var ret = 0;
		switch (this.myapi) {
		case API_HTML5:
			if (typeof this.instanceObject.currentTime !== "undefined")
				ret = this.instanceObject.currentTime;
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.is_paused)
					return this.resume_position;
				else
					ret = audRuntime.kahanTime.sum - this.startTime;
			}
			else if (typeof this.instanceObject.currentTime !== "undefined")
				ret = this.instanceObject.currentTime;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
		if (!this.looping && ret > duration)
			ret = duration;
		return ret;
	};
	C2AudioInstance.prototype.isPlaying = function ()
	{
		return !this.is_paused && !this.fresh && !this.stopped && !this.hasEnded();
	};
	C2AudioInstance.prototype.setVolume = function (v)
	{
		this.volume = v;
		this.updateVolume();
	};
	C2AudioInstance.prototype.updateVolume = function ()
	{
		var volToSet = this.volume * masterVolume;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.volume && this.instanceObject.volume !== volToSet)
				this.instanceObject.volume = volToSet;
			break;
		case API_WEBAUDIO:
			this.gainNode["gain"]["value"] = volToSet * this.mutevol;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.getVolume = function ()
	{
		return this.volume;
	};
	C2AudioInstance.prototype.doSetMuted = function (m)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.muted !== !!m)
				this.instanceObject.muted = !!m;
			break;
		case API_WEBAUDIO:
			this.mutevol = (m ? 0 : 1);
			this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setMuted = function (m)
	{
		this.is_muted = !!m;
		this.doSetMuted(this.is_muted || this.is_silent);
	};
	C2AudioInstance.prototype.setSilent = function (m)
	{
		this.is_silent = !!m;
		this.doSetMuted(this.is_muted || this.is_silent);
	};
	C2AudioInstance.prototype.setLooping = function (l)
	{
		this.looping = l;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_WEBAUDIO:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setPlaybackRate = function (r)
	{
		this.playbackRate = r;
		this.updatePlaybackRate();
	};
	C2AudioInstance.prototype.updatePlaybackRate = function ()
	{
		var r = this.playbackRate;
		if ((timescale_mode === 1 && !this.is_music) || timescale_mode === 2)
			r *= audRuntime.timescale;
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.playbackRate !== r)
				this.instanceObject.playbackRate = r;
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.instanceObject["playbackRate"]["value"] !== r)
					this.instanceObject["playbackRate"]["value"] = r;
			}
			else
			{
				if (this.instanceObject.playbackRate !== r)
					this.instanceObject.playbackRate = r;
			}
			break;
		case API_PHONEGAP:
			break;
		case API_APPMOBI:
			break;
		}
	};
	C2AudioInstance.prototype.setSuspended = function (s)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (s)
			{
				if (this.isPlaying())
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
					this.instanceObject["play"]();
			}
			break;
		case API_WEBAUDIO:
			if (s)
			{
				if (this.isPlaying())
				{
					if (this.buffer.myapi === API_WEBAUDIO)
					{
						this.resume_position = this.getPlaybackTime();
						if (this.looping)
							this.resume_position = this.resume_position % this.getDuration();
						stopSource(this.instanceObject);
					}
					else
						this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
				{
					if (this.buffer.myapi === API_WEBAUDIO)
					{
						this.instanceObject = context["createBufferSource"]();
						this.instanceObject["buffer"] = this.buffer.bufferObject;
						this.instanceObject["connect"](this.gainNode);
						this.instanceObject.loop = this.looping;
						this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
						this.startTime = audRuntime.kahanTime.sum - this.resume_position;
						startSourceAt(this.instanceObject, this.resume_position, this.getDuration());
					}
					else
					{
						this.instanceObject["play"]();
					}
				}
			}
			break;
		case API_PHONEGAP:
			if (s)
			{
				if (this.isPlaying())
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
					this.instanceObject["play"]();
			}
			break;
		case API_APPMOBI:
			break;
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		audRuntime = this.runtime;
		audInst = this;
		this.listenerTracker = null;
		this.listenerZ = -600;
		context = null;
		if (typeof AudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new AudioContext();
		}
		else if (typeof webkitAudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new webkitAudioContext();
		}
		if (this.runtime.isiOS && api === API_WEBAUDIO)
		{
			document.addEventListener("touchstart", function () {
				if (iOShadtouch)
					return;
				var buffer = context["createBuffer"](1, 1, 22050);
				var source = context["createBufferSource"]();
				source["buffer"] = buffer;
				source["connect"](context["destination"]);
				startSource(source);
				iOShadtouch = true;
			}, true);
		}
		if (api !== API_WEBAUDIO)
		{
			if (this.runtime.isPhoneGap)
				api = API_PHONEGAP;
			else if (this.runtime.isAppMobi)
				api = API_APPMOBI;
		}
		if (api === API_PHONEGAP)
		{
			appPath = location.href;
			var i = appPath.lastIndexOf("/");
			if (i > -1)
				appPath = appPath.substr(0, i + 1);
			appPath = appPath.replace("file://", "");
		}
		if (this.runtime.isSafari && this.runtime.isWindows && typeof Audio === "undefined")
		{
			alert("It looks like you're using Safari for Windows without Quicktime.  Audio cannot be played until Quicktime is installed.");
			this.runtime.DestroyInstance(this);
		}
		else
		{
			if (this.runtime.isDirectCanvas)
				useOgg = this.runtime.isAndroid;		// AAC on iOS, OGG on Android
			else
			{
				try {
					useOgg = !!(new Audio().canPlayType('audio/ogg; codecs="vorbis"'));
				}
				catch (e)
				{
					useOgg = false;
				}
			}
			switch (api) {
			case API_HTML5:
;
				break;
			case API_WEBAUDIO:
;
				break;
			case API_PHONEGAP:
;
				break;
			case API_APPMOBI:
;
				break;
			default:
;
			}
			this.runtime.tickMe(this);
		}
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function ()
	{
		timescale_mode = this.properties[0];	// 0 = off, 1 = sounds only, 2 = all
		panningModel = this.properties[1];		// 0 = equalpower, 1 = hrtf, 3 = soundfield
		distanceModel = this.properties[2];		// 0 = linear, 1 = inverse, 2 = exponential
		this.listenerZ = -this.properties[3];
		refDistance = this.properties[4];
		maxDistance = this.properties[5];
		rolloffFactor = this.properties[6];
		this.listenerTracker = new ObjectTracker();
		if (api === API_WEBAUDIO)
		{
			context["listener"]["speedOfSound"] = this.properties[7];
			context["listener"]["dopplerFactor"] = this.properties[8];
			context["listener"]["setPosition"](this.runtime.width / 2, this.runtime.height / 2, this.listenerZ);
			context["listener"]["setOrientation"](0, 0, 1, 0, -1, 0);
			window["c2OnAudioMicStream"] = function (localMediaStream, tag)
			{
				if (micSource)
					micSource["disconnect"]();
				micTag = tag.toLowerCase();
				micSource = context["createMediaStreamSource"](localMediaStream);
				micSource["connect"](getDestinationForTag(micTag));
			};
		}
		this.runtime.addSuspendCallback(function(s)
		{
			audInst.onSuspend(s);
		});
		var self = this;
		this.runtime.addDestroyCallback(function (inst)
		{
			self.onInstanceDestroyed(inst);
		});
	};
	instanceProto.onInstanceDestroyed = function (inst)
	{
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (a.objectTracker)
			{
				if (a.objectTracker.obj === inst)
				{
					a.objectTracker.obj = null;
					if (a.pannerEnabled && a.isPlaying() && a.looping)
						a.stop();
				}
			}
		}
		if (this.listenerTracker.obj === inst)
			this.listenerTracker.obj = null;
	};
	instanceProto.saveToJSON = function ()
	{
		var o = {
			"silent": silent,
			"masterVolume": masterVolume,
			"listenerZ": this.listenerZ,
			"listenerUid": this.listenerTracker.hasObject() ? this.listenerTracker.obj.uid : -1,
			"playing": [],
			"effects": {}
		};
		var playingarr = o["playing"];
		var i, len, a, d, p, panobj, playbackTime;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (!a.isPlaying())
				continue;		// no need to save stopped sounds
			playbackTime = a.getPlaybackTime();
			if (a.looping)
				playbackTime = playbackTime % a.getDuration();
			d = {
				"tag": a.tag,
				"buffersrc": a.buffer.src,
				"is_music": a.is_music,
				"playbackTime": playbackTime,
				"volume": a.volume,
				"looping": a.looping,
				"muted": a.is_muted,
				"playbackRate": a.playbackRate,
				"paused": a.is_paused,
				"resume_position": a.resume_position
			};
			if (a.pannerEnabled)
			{
				d["pan"] = {};
				panobj = d["pan"];
				if (a.objectTracker && a.objectTracker.hasObject())
				{
					panobj["objUid"] = a.objectTracker.obj.uid;
				}
				else
				{
					panobj["x"] = a.panX;
					panobj["y"] = a.panY;
					panobj["a"] = a.panAngle;
				}
				panobj["ia"] = a.panConeInner;
				panobj["oa"] = a.panConeOuter;
				panobj["og"] = a.panConeOuterGain;
			}
			playingarr.push(d);
		}
		var fxobj = o["effects"];
		var fxarr;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				fxarr = [];
				for (i = 0, len = effects[p].length; i < len; i++)
				{
					fxarr.push({ "type": effects[p][i].type, "params": effects[p][i].params });
				}
				fxobj[p] = fxarr;
			}
		}
		return o;
	};
	var objectTrackerUidsToLoad = [];
	instanceProto.loadFromJSON = function (o)
	{
		var setSilent = o["silent"];
		masterVolume = o["masterVolume"];
		this.listenerZ = o["listenerZ"];
		this.listenerTracker.setObject(null);
		var listenerUid = o["listenerUid"];
		if (listenerUid !== -1)
		{
			this.listenerTracker.loadUid = listenerUid;
			objectTrackerUidsToLoad.push(this.listenerTracker);
		}
		var playingarr = o["playing"];
		var i, len, d, src, is_music, tag, playbackTime, looping, vol, b, a, p, pan, panObjUid;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			audioInstances[i].stop();
		}
		var fxarr, fxtype, fxparams, fx;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				for (i = 0, len = effects[p].length; i < len; i++)
					effects[p][i].remove();
			}
		}
		cr.wipe(effects);
		for (p in o["effects"])
		{
			if (o["effects"].hasOwnProperty(p))
			{
				fxarr = o["effects"][p];
				for (i = 0, len = fxarr.length; i < len; i++)
				{
					fxtype = fxarr[i]["type"];
					fxparams = fxarr[i]["params"];
					switch (fxtype) {
					case "filter":
						addEffectForTag(p, new FilterEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4], fxparams[5]));
						break;
					case "delay":
						addEffectForTag(p, new DelayEffect(fxparams[0], fxparams[1], fxparams[2]));
						break;
					case "convolve":
						src = fxparams[2];
						b = this.getAudioBuffer(src, false);
						if (b.bufferObject)
						{
							fx = new ConvolveEffect(b.bufferObject, fxparams[0], fxparams[1], src);
						}
						else
						{
							fx = new ConvolveEffect(null, fxparams[0], fxparams[1], src);
							b.normalizeWhenReady = fxparams[0];
							b.convolveWhenReady = fx;
						}
						addEffectForTag(p, fx);
						break;
					case "flanger":
						addEffectForTag(p, new FlangerEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "phaser":
						addEffectForTag(p, new PhaserEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4], fxparams[5]));
						break;
					case "gain":
						addEffectForTag(p, new GainEffect(fxparams[0]));
						break;
					case "tremolo":
						addEffectForTag(p, new TremoloEffect(fxparams[0], fxparams[1]));
						break;
					case "ringmod":
						addEffectForTag(p, new RingModulatorEffect(fxparams[0], fxparams[1]));
						break;
					case "distortion":
						addEffectForTag(p, new DistortionEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "compressor":
						addEffectForTag(p, new CompressorEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "analyser":
						addEffectForTag(p, new AnalyserEffect(fxparams[0], fxparams[1]));
						break;
					}
				}
			}
		}
		for (i = 0, len = playingarr.length; i < len; i++)
		{
			d = playingarr[i];
			src = d["buffersrc"];
			is_music = d["is_music"];
			tag = d["tag"];
			playbackTime = d["playbackTime"];
			looping = d["looping"];
			vol = d["volume"];
			pan = d["pan"];
			panObjUid = (pan && pan.hasOwnProperty("objUid")) ? pan["objUid"] : -1;
			a = this.getAudioInstance(src, tag, is_music, looping, vol);
			if (!a)
			{
				b = this.getAudioBuffer(src, is_music);
				b.seekWhenReady = playbackTime;
				b.pauseWhenReady = d["paused"];
				if (pan)
				{
					if (panObjUid !== -1)
					{
						b.panWhenReady.push({ objUid: panObjUid, ia: pan["ia"], oa: pan["oa"], og: pan["og"], thistag: tag });
					}
					else
					{
						b.panWhenReady.push({ x: pan["x"], y: pan["y"], a: pan["a"], ia: pan["ia"], oa: pan["oa"], og: pan["og"], thistag: tag });
					}
				}
				continue;
			}
			a.resume_position = d["resume_position"];
			a.setPannerEnabled(!!pan);
			a.play(looping, vol, playbackTime);
			a.updatePlaybackRate();
			a.updateVolume();
			a.doSetMuted(a.is_muted || a.is_silent);
			if (d["paused"])
				a.pause();
			if (d["muted"])
				a.mute();
			if (pan)
			{
				if (panObjUid !== -1)
				{
					a.objectTracker = a.objectTracker || new ObjectTracker();
					a.objectTracker.loadUid = panObjUid;
					objectTrackerUidsToLoad.push(a.objectTracker);
				}
				else
				{
					a.setPan(pan["x"], pan["y"], pan["a"], pan["ia"], pan["oa"], pan["og"]);
				}
			}
		}
		if (setSilent && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(true);
			silent = true;
		}
		else if (!setSilent && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(false);
			silent = false;
		}
	};
	instanceProto.afterLoad = function ()
	{
		var i, len, ot, inst;
		for (i = 0, len = objectTrackerUidsToLoad.length; i < len; i++)
		{
			ot = objectTrackerUidsToLoad[i];
			inst = this.runtime.getObjectByUID(ot.loadUid);
			ot.setObject(inst);
			ot.loadUid = -1;
			if (inst)
			{
				listenerX = inst.x;
				listenerY = inst.y;
			}
		}
		objectTrackerUidsToLoad.length = 0;
	};
	instanceProto.onSuspend = function (s)
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].setSuspended(s);
	};
	instanceProto.tick = function ()
	{
		var dt = this.runtime.dt;
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			a.tick(dt);
			if (a.myapi !== API_HTML5 && a.myapi !== API_APPMOBI)
			{
				if (!a.fresh && !a.stopped && a.hasEnded())
				{
					a.stopped = true;
					audTag = a.tag;
					audRuntime.trigger(cr.plugins_.Audio.prototype.cnds.OnEnded, audInst);
				}
			}
			if (timescale_mode !== 0)
				a.updatePlaybackRate();
		}
		var p, arr, f;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				arr = effects[p];
				for (i = 0, len = arr.length; i < len; i++)
				{
					f = arr[i];
					if (f.tick)
						f.tick();
				}
			}
		}
		if (api === API_WEBAUDIO && this.listenerTracker.hasObject())
		{
			this.listenerTracker.tick(dt);
			listenerX = this.listenerTracker.obj.x;
			listenerY = this.listenerTracker.obj.y;
			context["listener"]["setPosition"](this.listenerTracker.obj.x, this.listenerTracker.obj.y, this.listenerZ);
			context["listener"]["setVelocity"](this.listenerTracker.getVelocityX(), this.listenerTracker.getVelocityY(), 0);
		}
	};
	instanceProto.getAudioBuffer = function (src_, is_music)
	{
		var i, len, a, ret = null, j, k, lenj, ai;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			a = audioBuffers[i];
			if (a.src === src_)
			{
				ret = a;
				break;
			}
		}
		if (!ret)
		{
			ret = new C2AudioBuffer(src_, is_music);
			audioBuffers.push(ret);
		}
		if (ret.is_music && audRuntime.isMobile)
		{
			for (i = 0, len = audioBuffers.length; i < len; ++i)
			{
				a = audioBuffers[i];
				if (a === ret || !a.is_music)
					continue;
				a.bufferObject = null;			// release Web Audio API buffer (decoded)
				for (j = 0, k = 0, lenj = audioInstances.length; j < lenj; ++j)
				{
					ai = audioInstances[j];
					audioInstances[k] = ai;
					if (ai.buffer === a && ai.myapi === API_WEBAUDIO)
					{
						ai.gainNode["disconnect"]();
						if (a.myapi === API_WEBAUDIO)
							ai.instanceObject["disconnect"]();
					}
					else
						++k;
				}
				audioInstances.length = k;
			}
			ret.decodeAudioBuffer();
		}
		return ret;
	};
	instanceProto.getAudioInstance = function (src_, tag, is_music, looping, vol)
	{
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (a.src === src_ && (a.canBeRecycled() || is_music))
			{
				a.tag = tag;
				return a;
			}
		}
		var b = this.getAudioBuffer(src_, is_music);
		if (!b.bufferObject)
		{
			if (tag !== "<preload>")
			{
				b.playTagWhenReady = tag;
				b.loopWhenReady = looping;
				b.volumeWhenReady = vol;
			}
			return null;
		}
		a = new C2AudioInstance(b, tag);
		audioInstances.push(a);
		return a;
	};
	var taggedAudio = [];
	function getAudioByTag(tag)
	{
		taggedAudio.length = 0;
		if (!tag.length)
		{
			if (!lastAudio || lastAudio.hasEnded())
				return;
			else
			{
				taggedAudio.length = 1;
				taggedAudio[0] = lastAudio;
				return;
			}
		}
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			if (cr.equals_nocase(tag, a.tag))
				taggedAudio.push(a);
		}
	};
	function reconnectEffects(tag)
	{
		var i, len, arr, n, toNode = context["destination"];
		if (effects.hasOwnProperty(tag))
		{
			arr = effects[tag];
			if (arr.length)
			{
				toNode = arr[0].getInputNode();
				for (i = 0, len = arr.length; i < len; i++)
				{
					n = arr[i];
					if (i + 1 === len)
						n.connectTo(context["destination"]);
					else
						n.connectTo(arr[i + 1].getInputNode());
				}
			}
		}
		getAudioByTag(tag);
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].reconnect(toNode);
		if (micSource && micTag === tag)
		{
			micSource["disconnect"]();
			micSource["connect"](toNode);
		}
	};
	function addEffectForTag(tag, fx)
	{
		if (!effects.hasOwnProperty(tag))
			effects[tag] = [fx];
		else
			effects[tag].push(fx);
		reconnectEffects(tag);
	};
	function Cnds() {};
	Cnds.prototype.OnEnded = function (t)
	{
		return cr.equals_nocase(audTag, t);
	};
	Cnds.prototype.PreloadsComplete = function ()
	{
		var i, len;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			if (!audioBuffers[i].isLoaded())
				return false;
		}
		return true;
	};
	Cnds.prototype.AdvancedAudioSupported = function ()
	{
		return api === API_WEBAUDIO;
	};
	Cnds.prototype.IsSilent = function ()
	{
		return silent;
	};
	Cnds.prototype.IsAnyPlaying = function ()
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			if (audioInstances[i].isPlaying())
				return true;
		}
		return false;
	};
	Cnds.prototype.IsTagPlaying = function (tag)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			if (taggedAudio[i].isPlaying())
				return true;
		}
		return false;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Play = function (file, looping, vol, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
			return;
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtPosition = function (file, looping, vol, x_, y_, angle_, innerangle_, outerangle_, outergain_, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ x: x_, y: y_, a: angle_, ia: innerangle_, oa: outerangle_, og: dbToLinear(outergain_), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		lastAudio.setPan(x_, y_, angle_, innerangle_, outerangle_, dbToLinear(outergain_));
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtObject = function (file, looping, vol, obj, innerangle, outerangle, outergain, tag)
	{
		if (silent || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst)
			return;
		var v = dbToLinear(vol);
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ obj: inst, ia: innerangle, oa: outerangle, og: dbToLinear(outergain), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		lastAudio.setPan(px, py, cr.to_degrees(inst.angle - inst.layer.getAngle()), innerangle, outerangle, dbToLinear(outergain));
		lastAudio.setObject(inst);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
			return;
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtPositionByName = function (folder, filename, looping, vol, x_, y_, angle_, innerangle_, outerangle_, outergain_, tag)
	{
		if (silent)
			return;
		var v = dbToLinear(vol);
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ x: x_, y: y_, a: angle_, ia: innerangle_, oa: outerangle_, og: dbToLinear(outergain_), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		lastAudio.setPan(x_, y_, angle_, innerangle_, outerangle_, dbToLinear(outergain_));
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.PlayAtObjectByName = function (folder, filename, looping, vol, obj, innerangle, outerangle, outergain, tag)
	{
		if (silent || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst)
			return;
		var v = dbToLinear(vol);
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		if (!lastAudio)
		{
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ obj: inst, ia: innerangle, oa: outerangle, og: dbToLinear(outergain), thistag: tag });
			return;
		}
		lastAudio.setPannerEnabled(true);
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		lastAudio.setPan(px, py, cr.to_degrees(inst.angle - inst.layer.getAngle()), innerangle, outerangle, dbToLinear(outergain));
		lastAudio.setObject(inst);
		lastAudio.play(looping!==0, v);
	};
	Acts.prototype.SetLooping = function (tag, looping)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setLooping(looping === 0);
	};
	Acts.prototype.SetMuted = function (tag, muted)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setMuted(muted === 0);
	};
	Acts.prototype.SetVolume = function (tag, vol)
	{
		getAudioByTag(tag);
		var v = dbToLinear(vol);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setVolume(v);
	};
	Acts.prototype.Preload = function (file)
	{
		if (silent)
			return;
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			return;
		}
		else if (api === API_PHONEGAP)
		{
			return;
		}
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	Acts.prototype.PreloadByName = function (folder, filename)
	{
		if (silent)
			return;
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			return;
		}
		else if (api === API_PHONEGAP)
		{
			return;
		}
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	Acts.prototype.SetPlaybackRate = function (tag, rate)
	{
		getAudioByTag(tag);
		if (rate < 0.0)
			rate = 0;
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setPlaybackRate(rate);
	};
	Acts.prototype.Stop = function (tag)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].stop();
	};
	Acts.prototype.StopAll = function ()
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].stop();
	};
	Acts.prototype.SetPaused = function (tag, state)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			if (state === 0)
				taggedAudio[i].pause();
			else
				taggedAudio[i].resume();
		}
	};
	Acts.prototype.Seek = function (tag, pos)
	{
		getAudioByTag(tag);
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			taggedAudio[i].seek(pos);
		}
	};
	Acts.prototype.SetSilent = function (s)
	{
		var i, len;
		if (s === 2)					// toggling
			s = (silent ? 1 : 0);		// choose opposite state
		if (s === 0 && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(true);
			silent = true;
		}
		else if (s === 1 && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(false);
			silent = false;
		}
	};
	Acts.prototype.SetMasterVolume = function (vol)
	{
		masterVolume = dbToLinear(vol);
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].updateVolume();
	};
	Acts.prototype.AddFilterEffect = function (tag, type, freq, detune, q, gain, mix)
	{
		if (api !== API_WEBAUDIO || type < 0 || type >= filterTypes.length)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new FilterEffect(type, freq, detune, q, gain, mix));
	};
	Acts.prototype.AddDelayEffect = function (tag, delay, gain, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new DelayEffect(delay, dbToLinear(gain), mix));
	};
	Acts.prototype.AddFlangerEffect = function (tag, delay, modulation, freq, feedback, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new FlangerEffect(delay / 1000, modulation / 1000, freq, feedback / 100, mix));
	};
	Acts.prototype.AddPhaserEffect = function (tag, freq, detune, q, mod, modfreq, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new PhaserEffect(freq, detune, q, mod, modfreq, mix));
	};
	Acts.prototype.AddConvolutionEffect = function (tag, file, norm, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		var doNormalize = (norm === 0);
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		var b = this.getAudioBuffer(src, false);
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		var fx;
		if (b.bufferObject)
		{
			fx = new ConvolveEffect(b.bufferObject, doNormalize, mix, src);
		}
		else
		{
			fx = new ConvolveEffect(null, doNormalize, mix, src);
			b.normalizeWhenReady = doNormalize;
			b.convolveWhenReady = fx;
		}
		addEffectForTag(tag, fx);
	};
	Acts.prototype.AddGainEffect = function (tag, g)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new GainEffect(dbToLinear(g)));
	};
	Acts.prototype.AddMuteEffect = function (tag)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new GainEffect(0));	// re-use gain effect with 0 gain
	};
	Acts.prototype.AddTremoloEffect = function (tag, freq, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new TremoloEffect(freq, mix));
	};
	Acts.prototype.AddRingModEffect = function (tag, freq, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new RingModulatorEffect(freq, mix));
	};
	Acts.prototype.AddDistortionEffect = function (tag, threshold, headroom, drive, makeupgain, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new DistortionEffect(threshold, headroom, drive, makeupgain, mix));
	};
	Acts.prototype.AddCompressorEffect = function (tag, threshold, knee, ratio, attack, release)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new CompressorEffect(threshold, knee, ratio, attack / 1000, release / 1000));
	};
	Acts.prototype.AddAnalyserEffect = function (tag, fftSize, smoothing)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		addEffectForTag(tag, new AnalyserEffect(fftSize, smoothing));
	};
	Acts.prototype.RemoveEffects = function (tag)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		var i, len, arr;
		if (effects.hasOwnProperty(tag))
		{
			arr = effects[tag];
			if (arr.length)
			{
				for (i = 0, len = arr.length; i < len; i++)
					arr[i].remove();
				arr.length = 0;
				reconnectEffects(tag);
			}
		}
	};
	Acts.prototype.SetEffectParameter = function (tag, index, param, value, ramp, time)
	{
		if (api !== API_WEBAUDIO)
			return;
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var arr;
		if (!effects.hasOwnProperty(tag))
			return;
		arr = effects[tag];
		if (index < 0 || index >= arr.length)
			return;
		arr[index].setParam(param, value, ramp, time);
	};
	Acts.prototype.SetListenerObject = function (obj_)
	{
		if (!obj_ || api !== API_WEBAUDIO)
			return;
		var inst = obj_.getFirstPicked();
		if (!inst)
			return;
		this.listenerTracker.setObject(inst);
		listenerX = inst.x;
		listenerY = inst.y;
	};
	Acts.prototype.SetListenerZ = function (z)
	{
		this.listenerZ = z;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Duration = function (ret, tag)
	{
		getAudioByTag(tag);
		if (taggedAudio.length)
			ret.set_float(taggedAudio[0].getDuration());
		else
			ret.set_float(0);
	};
	Exps.prototype.PlaybackTime = function (ret, tag)
	{
		getAudioByTag(tag);
		if (taggedAudio.length)
			ret.set_float(taggedAudio[0].getPlaybackTime());
		else
			ret.set_float(0);
	};
	Exps.prototype.Volume = function (ret, tag)
	{
		getAudioByTag(tag);
		if (taggedAudio.length)
		{
			var v = taggedAudio[0].getVolume();
			ret.set_float(linearToDb(v));
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.MasterVolume = function (ret)
	{
		ret.set_float(masterVolume);
	};
	Exps.prototype.EffectCount = function (ret, tag)
	{
		tag = tag.toLowerCase();
		var arr = null;
		if (effects.hasOwnProperty(tag))
			arr = effects[tag];
		ret.set_int(arr ? arr.length : 0);
	};
	function getAnalyser(tag, index)
	{
		var arr = null;
		if (effects.hasOwnProperty(tag))
			arr = effects[tag];
		if (arr && index >= 0 && index < arr.length && arr[index].freqBins)
			return arr[index];
		else
			return null;
	};
	Exps.prototype.AnalyserFreqBinCount = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
		ret.set_int(analyser ? analyser.node["frequencyBinCount"] : 0);
	};
	Exps.prototype.AnalyserFreqBinAt = function (ret, tag, index, bin)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		bin = Math.floor(bin);
		var analyser = getAnalyser(tag, index);
		if (!analyser)
			ret.set_float(0);
		else if (bin < 0 || bin >= analyser.node["frequencyBinCount"])
			ret.set_float(0);
		else
			ret.set_float(analyser.freqBins[bin]);
	};
	Exps.prototype.AnalyserPeakLevel = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
		if (analyser)
			ret.set_float(analyser.peak);
		else
			ret.set_float(0);
	};
	Exps.prototype.AnalyserRMSLevel = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
		if (analyser)
			ret.set_float(analyser.rms);
		else
			ret.set_float(0);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Browser = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Browser.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		window.addEventListener("resize", function () {
			self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnResize, self);
		});
		if (typeof navigator.onLine !== "undefined")
		{
			window.addEventListener("online", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOnline, self);
			});
			window.addEventListener("offline", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOffline, self);
			});
		}
		if (typeof window.applicationCache !== "undefined")
		{
			window.applicationCache.addEventListener('updateready', function() {
				self.runtime.loadingprogress = 1;
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
			});
			window.applicationCache.addEventListener('progress', function(e) {
				self.runtime.loadingprogress = e["loaded"] / e["total"];
			});
		}
		if (!this.runtime.isDirectCanvas)
		{
			document.addEventListener("appMobi.device.update.available", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
			});
			document.addEventListener("menubutton", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton, self);
			});
			document.addEventListener("searchbutton", function() {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnSearchButton, self);
			});
		}
		this.runtime.addSuspendCallback(function(s) {
			if (s)
			{
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageHidden, self);
			}
			else
			{
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageVisible, self);
			}
		});
		this.is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
		this.fullscreenOldMarginCss = "";
	};
	function Cnds() {};
	Cnds.prototype.CookiesEnabled = function()
	{
		return navigator ? navigator.cookieEnabled : false;
	};
	Cnds.prototype.IsOnline = function()
	{
		return navigator ? navigator.onLine : false;
	};
	Cnds.prototype.HasJava = function()
	{
		return navigator ? navigator.javaEnabled() : false;
	};
	Cnds.prototype.OnOnline = function()
	{
		return true;
	};
	Cnds.prototype.OnOffline = function()
	{
		return true;
	};
	Cnds.prototype.IsDownloadingUpdate = function ()
	{
		if (typeof window["applicationCache"] === "undefined")
			return false;
		else
			return window["applicationCache"]["status"] === window["applicationCache"]["DOWNLOADING"];
	};
	Cnds.prototype.OnUpdateReady = function ()
	{
		return true;
	};
	Cnds.prototype.PageVisible = function ()
	{
		return !this.runtime.isSuspended;
	};
	Cnds.prototype.OnPageVisible = function ()
	{
		return true;
	};
	Cnds.prototype.OnPageHidden = function ()
	{
		return true;
	};
	Cnds.prototype.OnResize = function ()
	{
		return true;
	};
	Cnds.prototype.IsFullscreen = function ()
	{
		return !!(document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.runtime.isNodeFullscreen);
	};
	Cnds.prototype.OnMenuButton = function ()
	{
		return true;
	};
	Cnds.prototype.OnSearchButton = function ()
	{
		return true;
	};
	Cnds.prototype.IsMetered = function ()
	{
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			return false;
		return connection["metered"];
	};
	Cnds.prototype.IsCharging = function ()
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (!battery)
			return true;
		return battery["charging"];
	};
	Cnds.prototype.IsPortraitLandscape = function (p)
	{
		var current = (window.innerWidth <= window.innerHeight ? 0 : 1);
		return current === p;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Alert = function (msg)
	{
		if (!this.runtime.isDomFree)
			alert(msg.toString());
	};
	Acts.prototype.Close = function ()
	{
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["forceToFinish"]();
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.close();
	};
	Acts.prototype.Focus = function ()
	{
		if (this.runtime.isNodeWebkit)
		{
			var win = window["nwgui"]["Window"]["get"]();
			win["focus"]();
		}
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.focus();
	};
	Acts.prototype.Blur = function ()
	{
		if (this.runtime.isNodeWebkit)
		{
			var win = window["nwgui"]["Window"]["get"]();
			win["blur"]();
		}
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.blur();
	};
	Acts.prototype.GoBack = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree && window.back)
			window.back();
	};
	Acts.prototype.GoForward = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree && window.forward)
			window.forward();
	};
	Acts.prototype.GoHome = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree && window.home)
			window.home();
	};
	Acts.prototype.GoToURL = function (url)
	{
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](url);
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.location = url;
	};
	Acts.prototype.GoToURLWindow = function (url, tag)
	{
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](url);
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.open(url, tag);
	};
	Acts.prototype.Reload = function ()
	{
		if (!this.is_arcade && !this.runtime.isDomFree)
			window.location.reload();
	};
	var firstRequestFullscreen = true;
	var crruntime = null;
	function onFullscreenError()
	{
		if (typeof jQuery !== "undefined")
		{
			crruntime["setSize"](jQuery(window).width(), jQuery(window).height());
		}
	};
	Acts.prototype.RequestFullScreen = function (stretchmode)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Requesting fullscreen is not supported on this platform - the request has been ignored");
			return;
		}
		if (stretchmode >= 2)
			stretchmode += 1;
		if (stretchmode === 6)
			stretchmode = 2;
		if (this.runtime.isNodeWebkit)
		{
			if (!this.runtime.isNodeFullscreen)
			{
				window["nwgui"]["Window"]["get"]()["enterFullscreen"]();
				this.runtime.isNodeFullscreen = true;
			}
		}
		else
		{
			if (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"])
				return;
			this.fullscreenOldMarginCss = jQuery(this.runtime.canvasdiv).css("margin");
			jQuery(this.runtime.canvasdiv).css("margin", "0");
			window["c2resizestretchmode"] = (stretchmode > 0 ? 1 : 0);
			this.runtime.fullscreen_scaling = (stretchmode >= 2 ? stretchmode : 0);
			var elem = this.runtime.canvasdiv || this.runtime.canvas;
			if (firstRequestFullscreen)
			{
				firstRequestFullscreen = false;
				crruntime = this.runtime;
				elem.addEventListener("mozfullscreenerror", onFullscreenError);
				elem.addEventListener("webkitfullscreenerror", onFullscreenError);
				elem.addEventListener("msfullscreenerror", onFullscreenError);
				elem.addEventListener("fullscreenerror", onFullscreenError);
			}
			if (!cr.is_undefined(elem["webkitRequestFullScreen"]))
			{
				if (typeof Element !== "undefined" && typeof Element["ALLOW_KEYBOARD_INPUT"] !== "undefined")
					elem["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
				else
					elem["webkitRequestFullScreen"]();
			}
			else if (!cr.is_undefined(elem["mozRequestFullScreen"]))
				elem["mozRequestFullScreen"]();
			else if (!cr.is_undefined(elem["requestFullscreen"]))
				elem["requestFullscreen"]();
		}
	};
	Acts.prototype.CancelFullScreen = function ()
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Exiting fullscreen is not supported on this platform - the request has been ignored");
			return;
		}
		if (this.runtime.isNodeWebkit)
		{
			if (this.runtime.isNodeFullscreen)
			{
				window["nwgui"]["Window"]["get"]()["leaveFullscreen"]();
				this.runtime.isNodeFullscreen = false;
			}
		}
		else
		{
			if (!cr.is_undefined(document["webkitCancelFullScreen"]))
				document["webkitCancelFullScreen"]();
			if (!cr.is_undefined(document["mozCancelFullScreen"]))
				document["mozCancelFullScreen"]();
			if (!cr.is_undefined(document["exitFullscreen"]))
				document["exitFullscreen"]();
			jQuery(this.runtime.canvasdiv).css("margin", this.fullscreenOldMarginCss);
		}
	};
	Acts.prototype.Vibrate = function (pattern_)
	{
		try {
			var arr = pattern_.split(",");
			var i, len;
			for (i = 0, len = arr.length; i < len; i++)
			{
				arr[i] = parseInt(arr[i], 10);
			}
			if (navigator["vibrate"])
				navigator["vibrate"](arr);
			else if (navigator["mozVibrate"])
				navigator["mozVibrate"](arr);
			else if (navigator["webkitVibrate"])
				navigator["webkitVibrate"](arr);
		}
		catch (e) {}
	};
	Acts.prototype.InvokeDownload = function (url_, filename_)
	{
		var a = document.createElement("a");
		if (typeof a.download === "undefined")
		{
			window.open(url_);
		}
		else
		{
			var body = document.getElementsByTagName("body")[0];
			a.textContent = filename_;
			a.href = url_;
			a.download = filename_;
			body.appendChild(a);
			var clickEvent = document.createEvent("MouseEvent");
			clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
			a.dispatchEvent(clickEvent);
			body.removeChild(a);
		}
	};
	Acts.prototype.ConsoleLog = function (type_, msg_)
	{
		if (!console)
			return;
		if (type_ === 0 && console.log)
			console.log(msg_);
		if (type_ === 1 && console.warn)
			console.warn(msg_);
		if (type_ === 2 && console.error)
			console.error(msg_);
	};
	Acts.prototype.ConsoleGroup = function (name_)
	{
		if (console && console.group)
			console.group(name_);
	};
	Acts.prototype.ConsoleGroupEnd = function ()
	{
		if (console && console.groupEnd)
			console.groupEnd();
	};
	Acts.prototype.ExecJs = function (js_)
	{
		if (eval)
			eval(js_);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.URL = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.toString());
	};
	Exps.prototype.Protocol = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.protocol);
	};
	Exps.prototype.Domain = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.hostname);
	};
	Exps.prototype.PathName = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.pathname);
	};
	Exps.prototype.Hash = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.hash);
	};
	Exps.prototype.Referrer = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : document.referrer);
	};
	Exps.prototype.Title = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : document.title);
	};
	Exps.prototype.Name = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.appName);
	};
	Exps.prototype.Version = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.appVersion);
	};
	Exps.prototype.Language = function (ret)
	{
		if (navigator && navigator.language)
			ret.set_string(navigator.language);
		else
			ret.set_string("");
	};
	Exps.prototype.Platform = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.platform);
	};
	Exps.prototype.Product = function (ret)
	{
		if (navigator && navigator.product)
			ret.set_string(navigator.product);
		else
			ret.set_string("");
	};
	Exps.prototype.Vendor = function (ret)
	{
		if (navigator && navigator.vendor)
			ret.set_string(navigator.vendor);
		else
			ret.set_string("");
	};
	Exps.prototype.UserAgent = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : navigator.userAgent);
	};
	Exps.prototype.QueryString = function (ret)
	{
		ret.set_string(this.runtime.isDomFree ? "" : window.location.search);
	};
	Exps.prototype.QueryParam = function (ret, paramname)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_string("");
			return;
		}
		var match = RegExp('[?&]' + paramname + '=([^&]*)').exec(window.location.search);
		if (match)
			ret.set_string(decodeURIComponent(match[1].replace(/\+/g, ' ')));
		else
			ret.set_string("");
	};
	Exps.prototype.Bandwidth = function (ret)
	{
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			ret.set_float(Number.POSITIVE_INFINITY);
		else
			ret.set_float(connection["bandwidth"]);
	};
	Exps.prototype.BatteryLevel = function (ret)
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (!battery)
			ret.set_float(1);
		else
			ret.set_float(battery["level"]);
	};
	Exps.prototype.BatteryTimeLeft = function (ret)
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (!battery)
			ret.set_float(Number.POSITIVE_INFINITY);
		else
			ret.set_float(battery["dischargingTime"]);
	};
	Exps.prototype.ExecJS = function (ret, js_)
	{
		if (!eval)
		{
			ret.set_any(0);
			return;
		}
		var result = eval(js_);
		if (typeof result === "number")
			ret.set_any(result);
		else if (typeof result === "string")
			ret.set_any(result);
		else if (typeof result === "boolean")
			ret.set_any(result ? 1 : 0);
		else
			ret.set_any(0);
	};
	Exps.prototype.ScreenWidth = function (ret)
	{
		ret.set_int(screen.width);
	};
	Exps.prototype.ScreenHeight = function (ret)
	{
		ret.set_int(screen.height);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.CBhash = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.CBhash.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.lastResult = "";
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
			this.hexcase = 0;
			this.b64pad = " ";
	};
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	cnds.OnHashed = function ()
	{
		return true;
	};
	instanceProto.hex_md5 = function(s)    { return this.rstr2hex(rstr_md5(str2rstr_utf8(s))); }
	instanceProto.b64_md5 = function(s)    { return this.rstr2b64(rstr_md5(str2rstr_utf8(s))); }
	instanceProto.any_md5 = function(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
	instanceProto.hex_hmac_md5 = function(k, d)  { return this.rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	instanceProto.b64_hmac_md5 = function(k, d)  { return this.rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	instanceProto.any_hmac_md5= function(k, d, e)  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }
	instanceProto.hex_sha1 = function(s)    { return this.rstr2hex(rstr_sha1(str2rstr_utf8(s))); }
	instanceProto.b64_sha1 = function(s)    { return this.rstr2b64(rstr_sha1(str2rstr_utf8(s))); }
	instanceProto.any_sha1 = function(s, e) { return rstr2any(rstr_sha1(str2rstr_utf8(s)), e); }
	instanceProto.hex_hmac_sha1 = function(k, d)  { return this.rstr2hex(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d))); }
	instanceProto.b64_hmac_sha1 = function(k, d)  { return this.rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d))); }
	instanceProto.any_hmac_sha1 = function(k, d, e)  { return rstr2any(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)), e); }
	instanceProto.hex_sha256 = function(s)    { return this.rstr2hex(rstr_sha256(str2rstr_utf8(s))); }
	instanceProto.b64_sha256 = function(s)    { return this.rstr2b64(rstr_sha256(str2rstr_utf8(s))); }
	instanceProto.any_sha256 = function(s, e) { return rstr2any(rstr_sha256(str2rstr_utf8(s)), e); }
	instanceProto.hex_hmac_sha256 = function(k, d)  { return this.rstr2hex(rstr_hmac_sha256(str2rstr_utf8(k), str2rstr_utf8(d))); }
	instanceProto.b64_hmac_sha256 = function(k, d)  { return this.rstr2b64(rstr_hmac_sha256(str2rstr_utf8(k), str2rstr_utf8(d))); }
	instanceProto.any_hmac_sha256 = function(k, d, e)  { return rstr2any(rstr_hmac_sha256(str2rstr_utf8(k), str2rstr_utf8(d)), e); }
	/*
	* Convert a raw string to a hex string
	*/
	instanceProto.rstr2hex = function(input)
	{
		try { this.hexcase } catch(e) { this.hexcase = 0; }
		var hex_tab = this.hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var output = "";
		var x;
		for(var i = 0; i < input.length; i++)
		{
			x = input.charCodeAt(i);
			output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
		}
	return output;
	}
	/*
	* Convert a raw string to a base-64 string
	*/
	instanceProto.rstr2b64 = function(input)
	{
	try { this.b64pad } catch(e) { this.b64pad=''; }
	var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var output = "";
	var len = input.length;
	for(var i = 0; i < len; i += 3)
		{
		var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
		for(var j = 0; j < 4; j++)
			{
				if(i * 8 + j * 6 > input.length * 8) output += this.b64pad;
				else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
			}
		}
	return output;
	}
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	acts.set_hexoutput = function (format)
	{
		if (format == 0)
			this.hexcase = 0;
		else
			this.hexcase = 1;
	};
	acts.set_bpad = function (charac)
	{
		this.b64pad = charac;
	};
	acts.MD5_hash = function (string, format)
	{
		var outF = format;
		if (outF == 0)
			this.lastResult = this.hex_md5(string);
		else
			this.lastResult = this.b64_md5(string);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.MD5_pass = function (string, encoding)
	{
		this.lastResult = this.any_md5(string, encoding);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.HMAC_hash = function (key, data, Format)
	{
		if (Format == 0)
			this.lastResult = this.hex_hmac_md5(key, data);
		else
			this.lastResult = this.b64_hmac_md5(key, data);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.HMAC_pass = function (key, data, charString)
	{
		this.lastResult = this.any_hmac_md5(key, data, charString);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.SHA1_hash = function (string, format)
	{
		var outF = format;
		if (outF == 0)
			this.lastResult = this.hex_sha1(string);
		else
			this.lastResult = this.b64_sha1(string);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.SHA1_pass = function (string, encoding)
	{
		this.lastResult = this.any_sha1(string, encoding);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.HMACSHA1_hash = function (key, data, Format)
	{
		if (Format == 0)
			this.lastResult = this.hex_hmac_sha1(key, data);
		else
			this.lastResult = this.b64_hmac_sha1(key, data);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.HMACSHA1_pass = function (key, data, charString)
	{
		this.lastResult = this.any_hmac_sha1(key, data, charString);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.SHA256_hash = function (string, format)
	{
		var outF = format;
		if (outF == 0)
			this.lastResult = this.hex_sha256(string);
		else
			this.lastResult = this.b64_sha256(string);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.SHA256_pass = function (string, encoding)
	{
		this.lastResult = this.any_sha256(string, encoding);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.HMACSHA256_hash = function (key, data, Format)
	{
		if (Format == 0)
			this.lastResult = this.hex_hmac_sha256(key, data);
		else
			this.lastResult = this.b64_hmac_sha256(key, data);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	acts.HMACSHA256_pass = function (key, data, charString)
	{
		this.lastResult = this.any_hmac_sha256(key, data, charString);
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	exps.get_lastResult = function (ret)
	{
		ret.set_string(this.lastResult);
	};
	exps.MD5 = function (ret, data)
	{
		ret.set_string(this.hex_md5(data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.MD5B = function (ret, data)
	{
		ret.set_string(this.b64_md5(data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.MD5pass = function (ret, data, charstring)
	{
		ret.set_string(this.any_md5(data, charstring));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACMD5 = function (ret, key, data)
	{
		ret.set_string(this.hex_hmac_md5(key, data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACMD5B = function (ret, key, data)
	{
		ret.set_string(this.b64_hmac_md5(key, data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACMD5pass = function (ret, key, data, charstring)
	{
		ret.set_string(this.any_hmac_md5(key, data, charstring));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.SHA1 = function (ret, data)
	{
		ret.set_string(this.hex_sha1(data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.SHA1B = function (ret, data)
	{
		ret.set_string(this.b64_sha1(data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.SHA1pass = function (ret, data, charstring)
	{
		ret.set_string(this.any_sha1(data, charstring));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACSHA1 = function (ret, key, data)
	{
		ret.set_string(this.hex_hmac_sha1(key, data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACSHA1B = function (ret, key, data)
	{
		ret.set_string(this.b64_hmac_sha1(key, data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACSHA1pass = function (ret, key, data, charstring)
	{
		ret.set_string(this.any_hmac_sha1(key, data, charstring));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.SHA256 = function (ret, data)
	{
		ret.set_string(this.hex_sha256(data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.SHA256B = function (ret, data)
	{
		ret.set_string(this.b64_sha256(data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.SHA256pass = function (ret, data, charstring)
	{
		ret.set_string(this.any_sha256(data, charstring));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACSHA256 = function (ret, key, data)
	{
		ret.set_string(this.hex_hmac_sha256(key, data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACSHA256B = function (ret, key, data)
	{
		ret.set_string(this.b64_hmac_sha256(key, data));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
	exps.HMACSHA256pass = function (ret, key, data, charstring)
	{
		ret.set_string(this.any_hmac_sha256(key, data, charstring));
		this.runtime.trigger(cr.plugins_.CBhash.prototype.cnds.OnHashed, this);
	};
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * The JavaScript code implementing the algorithm is derived from the C code in RFC 1321 and is covered by the following copyright:
 * License to copy and use this software is granted provided that it is identified as the "RSA Data Security, Inc. MD5 Message-Digest Algorithm" in all material mentioning or referencing this software or this function.
 * License is also granted to make and use derivative works provided that such works are identified as "derived from the RSA Data Security, Inc. MD5 Message-Digest Algorithm" in all material mentioning or referencing the derived work.
 * RSA Data Security, Inc. makes no representations concerning either the merchantability of this software or the suitability of this software for any particular purpose. It is provided "as is" without express or implied warranty of any kind.
 * These notices must be retained in any copies of any part of this documentation and/or software.
 * This copyright does not prohibit distribution of the JavaScript MD5 code under the BSD license.
 */
/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}
/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);
  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }
  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}
/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;
  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }
  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }
  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);
  return output;
}
/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;
  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }
    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}
/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}
function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}
/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}
/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}
/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}
/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}
/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}
/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS 180-1
 * Version 2.2 Copyright Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */
	/*
	* Calculate the SHA1 of a raw string
	*/
	function rstr_sha1(s)
	{
		return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
	}
	/*
	* Calculate the HMAC-SHA1 of a key and some data (raw strings)
	*/
	function rstr_hmac_sha1(key, data)
	{
		var bkey = rstr2binb(key);
		if(bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);
		var ipad = Array(16), opad = Array(16);
		for(var i = 0; i < 16; i++)
		{
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
		return binb2rstr(binb_sha1(opad.concat(hash), 512 + 160));
	}
/*
 * Convert a raw string to an array of big-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binb(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
  return output;
}
/*
 * Convert an array of big-endian words to a string
 */
function binb2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (24 - i % 32)) & 0xFF);
  return output;
}
/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function binb_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;
  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;
  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;
    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = bit_rol(b, 30);
      b = a;
      a = t;
    }
    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);
}
/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}
/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2 Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 * Also http://anmar.eu.org/projects/jssha2/
 */
 /*
 * Calculate the sha256 of a raw string
 */
function rstr_sha256(s)
{
  return binb2rstr(binb_sha256(rstr2binb(s), s.length * 8));
}
/*
 * Calculate the HMAC-sha256 of a key and some data (raw strings)
 */
function rstr_hmac_sha256(key, data)
{
  var bkey = rstr2binb(key);
  if(bkey.length > 16) bkey = binb_sha256(bkey, key.length * 8);
  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }
  var hash = binb_sha256(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
  return binb2rstr(binb_sha256(opad.concat(hash), 512 + 256));
}
/*
 * Main sha256 function, with its support functions
 */
function sha256_S (X, n) {return ( X >>> n ) | (X << (32 - n));}
function sha256_R (X, n) {return ( X >>> n );}
function sha256_Ch(x, y, z) {return ((x & y) ^ ((~x) & z));}
function sha256_Maj(x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));}
function sha256_Sigma0256(x) {return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22));}
function sha256_Sigma1256(x) {return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25));}
function sha256_Gamma0256(x) {return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3));}
function sha256_Gamma1256(x) {return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10));}
function sha256_Sigma0512(x) {return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39));}
function sha256_Sigma1512(x) {return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41));}
function sha256_Gamma0512(x) {return (sha256_S(x, 1)  ^ sha256_S(x, 8) ^ sha256_R(x, 7));}
function sha256_Gamma1512(x) {return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6));}
var sha256_K = new Array
(
  1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
  -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
  1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
  264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
  -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
  113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
  1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
  -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
  430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
  1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
  -1866530822, -1538233109, -1090935817, -965641998
);
function binb_sha256(m, l)
{
  var HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
                       1359893119, -1694144372, 528734635, 1541459225);
  var W = new Array(64);
  var a, b, c, d, e, f, g, h;
  var i, j, T1, T2;
  /* append padding */
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;
  for(i = 0; i < m.length; i += 16)
  {
    a = HASH[0];
    b = HASH[1];
    c = HASH[2];
    d = HASH[3];
    e = HASH[4];
    f = HASH[5];
    g = HASH[6];
    h = HASH[7];
    for(j = 0; j < 64; j++)
    {
      if (j < 16) W[j] = m[j + i];
      else W[j] = safe_add(safe_add(safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
                                            sha256_Gamma0256(W[j - 15])), W[j - 16]);
      T1 = safe_add(safe_add(safe_add(safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
                                                          sha256_K[j]), W[j]);
      T2 = safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
      h = g;
      g = f;
      f = e;
      e = safe_add(d, T1);
      d = c;
      c = b;
      b = a;
      a = safe_add(T1, T2);
    }
    HASH[0] = safe_add(a, HASH[0]);
    HASH[1] = safe_add(b, HASH[1]);
    HASH[2] = safe_add(c, HASH[2]);
    HASH[3] = safe_add(d, HASH[3]);
    HASH[4] = safe_add(e, HASH[4]);
    HASH[5] = safe_add(f, HASH[5]);
    HASH[6] = safe_add(g, HASH[6]);
    HASH[7] = safe_add(h, HASH[7]);
  }
  return HASH;
}
}());
;
;
cr.plugins_.Function = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Function.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var funcStack = [];
	var funcStackPtr = -1;
	var isInPreview = false;	// set in onCreate
	function FuncStackEntry()
	{
		this.name = "";
		this.retVal = 0;
		this.params = [];
	};
	function pushFuncStack()
	{
		funcStackPtr++;
		if (funcStackPtr === funcStack.length)
			funcStack.push(new FuncStackEntry());
		return funcStack[funcStackPtr];
	};
	function getCurrentFuncStack()
	{
		if (funcStackPtr < 0)
			return null;
		return funcStack[funcStackPtr];
	};
	function getOneAboveFuncStack()
	{
		if (!funcStack.length)
			return null;
		var i = funcStackPtr + 1;
		if (i >= funcStack.length)
			i = funcStack.length - 1;
		return funcStack[i];
	};
	function popFuncStack()
	{
;
		funcStackPtr--;
	};
	instanceProto.onCreate = function()
	{
		isInPreview = (typeof cr_is_preview !== "undefined");
	};
	function Cnds() {};
	Cnds.prototype.OnFunction = function (name_)
	{
		var fs = getCurrentFuncStack();
		if (!fs)
			return false;
		return cr.equals_nocase(name_, fs.name);
	};
	Cnds.prototype.CompareParam = function (index_, cmp_, value_)
	{
		var fs = getCurrentFuncStack();
		if (!fs)
			return false;
		index_ = cr.floor(index_);
		if (index_ < 0 || index_ >= fs.params.length)
			return false;
		return cr.do_cmp(fs.params[index_], cmp_, value_);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.CallFunction = function (name_, params_)
	{
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		cr.shallowAssignArray(fs.params, params_);
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		if (isInPreview && !ran)
		{
;
		}
		popFuncStack();
	};
	Acts.prototype.SetReturnValue = function (value_)
	{
		var fs = getCurrentFuncStack();
		if (fs)
			fs.retVal = value_;
		else
;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.ReturnValue = function (ret)
	{
		var fs = getOneAboveFuncStack();
		if (fs)
			ret.set_any(fs.retVal);
		else
			ret.set_int(0);
	};
	Exps.prototype.ParamCount = function (ret)
	{
		var fs = getCurrentFuncStack();
		if (fs)
			ret.set_int(fs.params.length);
		else
		{
;
			ret.set_int(0);
		}
	};
	Exps.prototype.Param = function (ret, index_)
	{
		index_ = cr.floor(index_);
		var fs = getCurrentFuncStack();
		if (fs)
		{
			if (index_ >= 0 && index_ < fs.params.length)
			{
				ret.set_any(fs.params[index_]);
			}
			else
			{
;
				ret.set_int(0);
			}
		}
		else
		{
;
			ret.set_int(0);
		}
	};
	Exps.prototype.Call = function (ret, name_)
	{
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		fs.params.length = 0;
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
			fs.params.push(arguments[i]);
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		if (isInPreview && !ran)
		{
;
		}
		popFuncStack();
		ret.set_any(fs.retVal);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Keyboard = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Keyboard.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.keyMap = new Array(256);	// stores key up/down state
		this.usedKeys = new Array(256);
		this.triggerKey = 0;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		if (!this.runtime.isDomFree)
		{
			jQuery(document).keydown(
				function(info) {
					self.onKeyDown(info);
				}
			);
			jQuery(document).keyup(
				function(info) {
					self.onKeyUp(info);
				}
			);
		}
	};
	var keysToBlockWhenFramed = [32, 33, 34, 35, 36, 37, 38, 39, 40, 44];
	instanceProto.onKeyDown = function (info)
	{
		var alreadyPreventedDefault = false;
		if (window != window.top && keysToBlockWhenFramed.indexOf(info.which) > -1)
		{
			info.preventDefault();
			alreadyPreventedDefault = true;
			info.stopPropagation();
		}
		if (this.keyMap[info.which])
		{
			if (this.usedKeys[info.which] && !alreadyPreventedDefault)
				info.preventDefault();
			return;
		}
		this.keyMap[info.which] = true;
		this.triggerKey = info.which;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKey, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKey, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCode, this);
		if (eventRan || eventRan2)
		{
			this.usedKeys[info.which] = true;
			if (!alreadyPreventedDefault)
				info.preventDefault();
		}
	};
	instanceProto.onKeyUp = function (info)
	{
		this.keyMap[info.which] = false;
		this.triggerKey = info.which;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased, this);
		if (eventRan || eventRan2 || this.usedKeys[info.which])
		{
			this.usedKeys[info.which] = true;
			info.preventDefault();
		}
	};
	instanceProto.saveToJSON = function ()
	{
		return { "triggerKey": this.triggerKey };
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.triggerKey = o["triggerKey"];
	};
	function Cnds() {};
	Cnds.prototype.IsKeyDown = function(key)
	{
		return this.keyMap[key];
	};
	Cnds.prototype.OnKey = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnAnyKey = function(key)
	{
		return true;
	};
	Cnds.prototype.OnAnyKeyReleased = function(key)
	{
		return true;
	};
	Cnds.prototype.OnKeyReleased = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.IsKeyCodeDown = function(key)
	{
		key = Math.floor(key);
		if (key < 0 || key >= this.keyMap.length)
			return false;
		return this.keyMap[key];
	};
	Cnds.prototype.OnKeyCode = function(key)
	{
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnKeyCodeReleased = function(key)
	{
		return (key === this.triggerKey);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.LastKeyCode = function (ret)
	{
		ret.set_int(this.triggerKey);
	};
	function fixedStringFromCharCode(kc)
	{
		kc = Math.floor(kc);
		switch (kc) {
		case 8:		return "backspace";
		case 9:		return "tab";
		case 13:	return "enter";
		case 16:	return "shift";
		case 17:	return "control";
		case 18:	return "alt";
		case 19:	return "pause";
		case 20:	return "capslock";
		case 27:	return "esc";
		case 33:	return "pageup";
		case 34:	return "pagedown";
		case 35:	return "end";
		case 36:	return "home";
		case 37:	return "←";
		case 38:	return "↑";
		case 39:	return "→";
		case 40:	return "↓";
		case 45:	return "insert";
		case 46:	return "del";
		case 91:	return "left window key";
		case 92:	return "right window key";
		case 93:	return "select";
		case 96:	return "numpad 0";
		case 97:	return "numpad 1";
		case 98:	return "numpad 2";
		case 99:	return "numpad 3";
		case 100:	return "numpad 4";
		case 101:	return "numpad 5";
		case 102:	return "numpad 6";
		case 103:	return "numpad 7";
		case 104:	return "numpad 8";
		case 105:	return "numpad 9";
		case 106:	return "numpad *";
		case 107:	return "numpad +";
		case 109:	return "numpad -";
		case 110:	return "numpad .";
		case 111:	return "numpad /";
		case 112:	return "F1";
		case 113:	return "F2";
		case 114:	return "F3";
		case 115:	return "F4";
		case 116:	return "F5";
		case 117:	return "F6";
		case 118:	return "F7";
		case 119:	return "F8";
		case 120:	return "F9";
		case 121:	return "F10";
		case 122:	return "F11";
		case 123:	return "F12";
		case 144:	return "numlock";
		case 145:	return "scroll lock";
		case 186:	return ";";
		case 187:	return "=";
		case 188:	return ",";
		case 189:	return "-";
		case 190:	return ".";
		case 191:	return "/";
		case 192:	return "'";
		case 219:	return "[";
		case 220:	return "\\";
		case 221:	return "]";
		case 222:	return "#";
		case 223:	return "`";
		default:	return String.fromCharCode(kc);
		}
	};
	Exps.prototype.StringFromKeyCode = function (ret, kc)
	{
		ret.set_string(fixedStringFromCharCode(kc));
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Mouse = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Mouse.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.buttonMap = new Array(4);		// mouse down states
		this.mouseXcanvas = 0;				// mouse position relative to canvas
		this.mouseYcanvas = 0;
		this.triggerButton = 0;
		this.triggerType = 0;
		this.triggerDir = 0;
		this.handled = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		var self = this;
		if (!this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
			jQuery(document).dblclick(
				function(info) {
					self.onDoubleClick(info);
				}
			);
			var wheelevent = function(info) {
								self.onWheel(info);
							};
			document.addEventListener("mousewheel", wheelevent, false);
			document.addEventListener("DOMMouseScroll", wheelevent, false);
		}
	};
	var dummyoffset = {left: 0, top: 0};
	instanceProto.onMouseMove = function(info)
	{
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		this.mouseXcanvas = info.pageX - offset.left;
		this.mouseYcanvas = info.pageY - offset.top;
	};
	instanceProto.mouseInGame = function ()
	{
		if (this.runtime.fullscreen_mode > 0)
			return true;
		return this.mouseXcanvas >= 0 && this.mouseYcanvas >= 0
		    && this.mouseXcanvas < this.runtime.width && this.mouseYcanvas < this.runtime.height;
	};
	instanceProto.onMouseDown = function(info)
	{
		if (!this.mouseInGame())
			return;
		if (this.runtime.had_a_click)
			info.preventDefault();
		this.buttonMap[info.which] = true;
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnAnyClick, this);
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 0;					// single click
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
	};
	instanceProto.onMouseUp = function(info)
	{
		if (!this.buttonMap[info.which])
			return;
		if (this.runtime.had_a_click)
			info.preventDefault();
		this.runtime.had_a_click = true;
		this.buttonMap[info.which] = false;
		this.triggerButton = info.which - 1;	// 1-based
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnRelease, this);
	};
	instanceProto.onDoubleClick = function(info)
	{
		if (!this.mouseInGame())
			return;
		info.preventDefault();
		this.triggerButton = info.which - 1;	// 1-based
		this.triggerType = 1;					// double click
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnClick, this);
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnObjectClicked, this);
	};
	instanceProto.onWheel = function (info)
	{
		var delta = info.wheelDelta ? info.wheelDelta : info.detail ? -info.detail : 0;
		this.triggerDir = (delta < 0 ? 0 : 1);
		this.handled = false;
		this.runtime.trigger(cr.plugins_.Mouse.prototype.cnds.OnWheel, this);
		if (this.handled)
			info.preventDefault();
	};
	function Cnds() {};
	Cnds.prototype.OnClick = function (button, type)
	{
		return button === this.triggerButton && type === this.triggerType;
	};
	Cnds.prototype.OnAnyClick = function ()
	{
		return true;
	};
	Cnds.prototype.IsButtonDown = function (button)
	{
		return this.buttonMap[button + 1];	// jQuery uses 1-based buttons for some reason
	};
	Cnds.prototype.OnRelease = function (button)
	{
		return button === this.triggerButton;
	};
	Cnds.prototype.IsOverObject = function (obj)
	{
		var cnd = this.runtime.getCurrentCondition();
		var mx = this.mouseXcanvas;
		var my = this.mouseYcanvas;
		return cr.xor(this.runtime.testAndSelectCanvasPointOverlap(obj, mx, my, cnd.inverted), cnd.inverted);
	};
	Cnds.prototype.OnObjectClicked = function (button, type, obj)
	{
		if (button !== this.triggerButton || type !== this.triggerType)
			return false;	// wrong click type
		return this.runtime.testAndSelectCanvasPointOverlap(obj, this.mouseXcanvas, this.mouseYcanvas, false);
	};
	Cnds.prototype.OnWheel = function (dir)
	{
		this.handled = true;
		return dir === this.triggerDir;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetCursor = function (c)
	{
		var cursor_style = ["auto", "pointer", "text", "crosshair", "move", "help", "wait", "none"][c];
		if (this.runtime.canvas && this.runtime.canvas.style)
			this.runtime.canvas.style.cursor = cursor_style;
	};
	Acts.prototype.SetCursorSprite = function (obj)
	{
		if (this.runtime.isDomFree || this.runtime.isMobile || !obj)
			return;
		var inst = obj.getFirstPicked();
		if (!inst || !inst.curFrame)
			return;
		var frame = inst.curFrame;
		var datauri = frame.getDataUri();
		var cursor_style = "url(" + datauri + ") " + Math.round(frame.hotspotX * frame.width) + " " + Math.round(frame.hotspotY * frame.height) + ", auto";
		jQuery(this.runtime.canvas).css("cursor", cursor_style);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.X = function (ret, layerparam)
	{
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam)
	{
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.mouseXcanvas, this.mouseYcanvas, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret)
	{
		ret.set_float(this.mouseXcanvas);
	};
	Exps.prototype.AbsoluteY = function (ret)
	{
		ret.set_float(this.mouseYcanvas);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Rex_Date = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Rex_Date.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
	    this._timers = {};
	};
	function Cnds() {};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	pluginProto.acts = new Acts();
	Acts.prototype.StartTimer = function (name)
	{
	    var timer = new Date();
		this._timers[name] = timer.getTime();
	};
	function Exps() {};
	pluginProto.exps = new Exps();
	Exps.prototype.Year = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getFullYear());
	};
	Exps.prototype.Month = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getMonth()+1);
	};
	Exps.prototype.Date = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getDate());
	};
	Exps.prototype.Day = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getDay());
	};
	Exps.prototype.Hours = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getHours());
	};
	Exps.prototype.Minutes = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getMinutes());
	};
	Exps.prototype.Seconds = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getSeconds());
	};
	Exps.prototype.Milliseconds = function (ret, timestamp)
	{
	    var today = (timestamp != null)? new Date(timestamp): new Date();
		ret.set_int(today.getMilliseconds());
	};
	Exps.prototype.Timer = function (ret, name)
	{
	    var delta = 0;
		var start_tick = this._timers[name];
		if (start_tick != null) {
		    var timer = new Date();
		    delta = timer.getTime() - start_tick;
		}
		ret.set_int(delta);
	};
	Exps.prototype.CurTicks = function (ret)
	{
	    var today = new Date();
        ret.set_int(today.getTime());
	};
	Exps.prototype.UnixTimestamp = function (ret)
	{
	    var today = new Date();
        ret.set_float(today.getTime());
	};
	Exps.prototype.Date2UnixTimestamp = function (ret, year, month, day, hours, minutes, seconds, milliseconds)
	{
        var timestamp = new Date(year, month-1, day, hours, minutes, seconds, milliseconds); // build Date object
        ret.set_float(timestamp.getTime());
	};
}());
;
;
cr.plugins_.Sprite = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Sprite.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	function frame_getDataUri()
	{
		if (this.datauri.length === 0)
		{
			var tmpcanvas = document.createElement("canvas");
			tmpcanvas.width = this.width;
			tmpcanvas.height = this.height;
			var tmpctx = tmpcanvas.getContext("2d");
			if (this.spritesheeted)
			{
				tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
										 0, 0, this.width, this.height);
			}
			else
			{
				tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
			}
			this.datauri = tmpcanvas.toDataURL("image/png");
		}
		return this.datauri;
	};
	typeProto.onCreate = function()
	{
		if (this.is_family)
			return;
		var i, leni, j, lenj;
		var anim, frame, animobj, frameobj, wt, uv;
		this.all_frames = [];
		this.has_loaded_textures = false;
		for (i = 0, leni = this.animations.length; i < leni; i++)
		{
			anim = this.animations[i];
			animobj = {};
			animobj.name = anim[0];
			animobj.speed = anim[1];
			animobj.loop = anim[2];
			animobj.repeatcount = anim[3];
			animobj.repeatto = anim[4];
			animobj.pingpong = anim[5];
			animobj.sid = anim[6];
			animobj.frames = [];
			for (j = 0, lenj = anim[7].length; j < lenj; j++)
			{
				frame = anim[7][j];
				frameobj = {};
				frameobj.texture_file = frame[0];
				frameobj.texture_filesize = frame[1];
				frameobj.offx = frame[2];
				frameobj.offy = frame[3];
				frameobj.width = frame[4];
				frameobj.height = frame[5];
				frameobj.duration = frame[6];
				frameobj.hotspotX = frame[7];
				frameobj.hotspotY = frame[8];
				frameobj.image_points = frame[9];
				frameobj.poly_pts = frame[10];
				frameobj.pixelformat = frame[11];
				frameobj.spritesheeted = (frameobj.width !== 0);
				frameobj.datauri = "";		// generated on demand and cached
				frameobj.getDataUri = frame_getDataUri;
				uv = {};
				uv.left = 0;
				uv.top = 0;
				uv.right = 1;
				uv.bottom = 1;
				frameobj.sheetTex = uv;
				frameobj.webGL_texture = null;
				wt = this.runtime.findWaitingTexture(frame[0]);
				if (wt)
				{
					frameobj.texture_img = wt;
				}
				else
				{
					frameobj.texture_img = new Image();
					frameobj.texture_img["idtkLoadDisposed"] = true;
					frameobj.texture_img.src = frame[0];
					frameobj.texture_img.cr_src = frame[0];
					frameobj.texture_img.cr_filesize = frame[1];
					frameobj.texture_img.c2webGL_texture = null;
					this.runtime.wait_for_textures.push(frameobj.texture_img);
				}
				cr.seal(frameobj);
				animobj.frames.push(frameobj);
				this.all_frames.push(frameobj);
			}
			cr.seal(animobj);
			this.animations[i] = animobj;		// swap array data for object
		}
	};
	typeProto.updateAllCurrentTexture = function ()
	{
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.curWebGLTexture = inst.curFrame.webGL_texture;
		}
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			frame.texture_img.c2webGL_texture = null;
			frame.webGL_texture = null;
		}
	};
	typeProto.onRestoreWebGLContext = function ()
	{
		if (this.is_family || !this.instances.length)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
		}
		this.updateAllCurrentTexture();
	};
	typeProto.loadTextures = function ()
	{
		if (this.is_family || this.has_loaded_textures || !this.runtime.glwrap)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
		}
		this.has_loaded_textures = true;
	};
	typeProto.unloadTextures = function ()
	{
		if (this.is_family || this.instances.length || !this.has_loaded_textures)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frame = this.all_frames[i];
			this.runtime.glwrap.deleteTexture(frame.webGL_texture);
		}
		this.has_loaded_textures = false;
	};
	var already_drawn_images = [];
	typeProto.preloadCanvas2D = function (ctx)
	{
		var i, len, frameimg;
		already_drawn_images.length = 0;
		for (i = 0, len = this.all_frames.length; i < len; ++i)
		{
			frameimg = this.all_frames[i].texture_img;
			if (already_drawn_images.indexOf(frameimg) !== -1)
					continue;
			ctx.drawImage(frameimg, 0, 0);
			already_drawn_images.push(frameimg);
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		var poly_pts = this.type.animations[0].frames[0].poly_pts;
		if (this.recycled)
			this.collision_poly.set_pts(poly_pts);
		else
			this.collision_poly = new cr.CollisionPoly(poly_pts);
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		this.visible = (this.properties[0] === 0);	// 0=visible, 1=invisible
		this.isTicking = false;
		this.inAnimTrigger = false;
		this.collisionsEnabled = (this.properties[3] !== 0);
		if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.type.animations[0].speed !== 0)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		this.cur_animation = this.getAnimationByName(this.properties[1]) || this.type.animations[0];
		this.cur_frame = this.properties[2];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		var curanimframe = this.cur_animation.frames[this.cur_frame];
		this.collision_poly.set_pts(curanimframe.poly_pts);
		this.hotspotX = curanimframe.hotspotX;
		this.hotspotY = curanimframe.hotspotY;
		this.cur_anim_speed = this.cur_animation.speed;
		if (this.recycled)
			this.animTimer.reset();
		else
			this.animTimer = new cr.KahanAdder();
		this.frameStart = this.getNowTime();
		this.animPlaying = true;
		this.animRepeats = 0;
		this.animForwards = true;
		this.animTriggerName = "";
		this.changeAnimName = "";
		this.changeAnimFrom = 0;
		this.changeAnimFrame = -1;
		this.type.loadTextures();
		var i, leni, j, lenj;
		var anim, frame, uv, maintex;
		for (i = 0, leni = this.type.animations.length; i < leni; i++)
		{
			anim = this.type.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++)
			{
				frame = anim.frames[j];
				if (frame.width === 0)
				{
					frame.width = frame.texture_img.width;
					frame.height = frame.texture_img.height;
				}
				if (frame.spritesheeted)
				{
					maintex = frame.texture_img;
					uv = frame.sheetTex;
					uv.left = frame.offx / maintex.width;
					uv.top = frame.offy / maintex.height;
					uv.right = (frame.offx + frame.width) / maintex.width;
					uv.bottom = (frame.offy + frame.height) / maintex.height;
					if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height)
					{
						frame.spritesheeted = false;
					}
				}
			}
		}
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
	};
	instanceProto.saveToJSON = function ()
	{
		var o = {
			"a": this.cur_animation.sid,
			"f": this.cur_frame,
			"cas": this.cur_anim_speed,
			"fs": this.frameStart,
			"ar": this.animRepeats,
			"at": this.animTimer.sum
		};
		if (!this.animPlaying)
			o["ap"] = this.animPlaying;
		if (!this.animForwards)
			o["af"] = this.animForwards;
		return o;
	};
	instanceProto.loadFromJSON = function (o)
	{
		var anim = this.getAnimationBySid(o["a"]);
		if (anim)
			this.cur_animation = anim;
		this.cur_frame = o["f"];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		this.cur_anim_speed = o["cas"];
		this.frameStart = o["fs"];
		this.animRepeats = o["ar"];
		this.animTimer.reset();
		this.animTimer.sum = o["at"];
		this.animPlaying = o.hasOwnProperty("ap") ? o["ap"] : true;
		this.animForwards = o.hasOwnProperty("af") ? o["af"] : true;
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
		this.collision_poly.set_pts(this.curFrame.poly_pts);
		this.hotspotX = this.curFrame.hotspotX;
		this.hotspotY = this.curFrame.hotspotY;
	};
	instanceProto.animationFinish = function (reverse)
	{
		this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
		this.animPlaying = false;
		this.animTriggerName = this.cur_animation.name;
		this.inAnimTrigger = true;
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
		this.inAnimTrigger = false;
		this.animRepeats = 0;
	};
	instanceProto.getNowTime = function()
	{
		return this.animTimer.sum;
	};
	instanceProto.tick = function()
	{
		this.animTimer.add(this.runtime.getDt(this));
		if (this.changeAnimName.length)
			this.doChangeAnim();
		if (this.changeAnimFrame >= 0)
			this.doChangeAnimFrame();
		var now = this.getNowTime();
		var cur_animation = this.cur_animation;
		var prev_frame = cur_animation.frames[this.cur_frame];
		var next_frame;
		var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
		if (this.animPlaying && now >= this.frameStart + cur_frame_time)
		{
			if (this.animForwards)
			{
				this.cur_frame++;
			}
			else
			{
				this.cur_frame--;
			}
			this.frameStart += cur_frame_time;
			if (this.cur_frame >= cur_animation.frames.length)
			{
				if (cur_animation.pingpong)
				{
					this.animForwards = false;
					this.cur_frame = cur_animation.frames.length - 2;
				}
				else if (cur_animation.loop)
				{
					this.cur_frame = cur_animation.repeatto;
				}
				else
				{
					this.animRepeats++;
					if (this.animRepeats >= cur_animation.repeatcount)
					{
						this.animationFinish(false);
					}
					else
					{
						this.cur_frame = cur_animation.repeatto;
					}
				}
			}
			if (this.cur_frame < 0)
			{
				if (cur_animation.pingpong)
				{
					this.cur_frame = 1;
					this.animForwards = true;
					if (!cur_animation.loop)
					{
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount)
						{
							this.animationFinish(true);
						}
					}
				}
				else
				{
					if (cur_animation.loop)
					{
						this.cur_frame = cur_animation.repeatto;
					}
					else
					{
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount)
						{
							this.animationFinish(true);
						}
						else
						{
							this.cur_frame = cur_animation.repeatto;
						}
					}
				}
			}
			if (this.cur_frame < 0)
				this.cur_frame = 0;
			else if (this.cur_frame >= cur_animation.frames.length)
				this.cur_frame = cur_animation.frames.length - 1;
			if (now > this.frameStart + (cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed))
			{
				this.frameStart = now;
			}
			next_frame = cur_animation.frames[this.cur_frame];
			this.OnFrameChanged(prev_frame, next_frame);
			this.runtime.redraw = true;
		}
	};
	instanceProto.getAnimationByName = function (name_)
	{
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++)
		{
			a = this.type.animations[i];
			if (cr.equals_nocase(a.name, name_))
				return a;
		}
		return null;
	};
	instanceProto.getAnimationBySid = function (sid_)
	{
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++)
		{
			a = this.type.animations[i];
			if (a.sid === sid_)
				return a;
		}
		return null;
	};
	instanceProto.doChangeAnim = function ()
	{
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var anim = this.getAnimationByName(this.changeAnimName);
		this.changeAnimName = "";
		if (!anim)
			return;
		if (cr.equals_nocase(anim.name, this.cur_animation.name) && this.animPlaying)
			return;
		this.cur_animation = anim;
		this.cur_anim_speed = anim.speed;
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (this.changeAnimFrom === 1)
			this.cur_frame = 0;
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		this.animForwards = true;
		this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
		this.runtime.redraw = true;
	};
	instanceProto.doChangeAnimFrame = function ()
	{
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var prev_frame_number = this.cur_frame;
		this.cur_frame = cr.floor(this.changeAnimFrame);
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (prev_frame_number !== this.cur_frame)
		{
			this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
			this.frameStart = this.getNowTime();
			this.runtime.redraw = true;
		}
		this.changeAnimFrame = -1;
	};
	instanceProto.OnFrameChanged = function (prev_frame, next_frame)
	{
		var oldw = prev_frame.width;
		var oldh = prev_frame.height;
		var neww = next_frame.width;
		var newh = next_frame.height;
		if (oldw != neww)
			this.width *= (neww / oldw);
		if (oldh != newh)
			this.height *= (newh / oldh);
		this.hotspotX = next_frame.hotspotX;
		this.hotspotY = next_frame.hotspotY;
		this.collision_poly.set_pts(next_frame.poly_pts);
		this.set_bbox_changed();
		this.curFrame = next_frame;
		this.curWebGLTexture = next_frame.webGL_texture;
		var i, len, b;
		for (i = 0, len = this.behavior_insts.length; i < len; i++)
		{
			b = this.behavior_insts[i];
			if (b.onSpriteFrameChanged)
				b.onSpriteFrameChanged(prev_frame, next_frame);
		}
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this);
	};
	instanceProto.draw = function(ctx)
	{
		ctx.globalAlpha = this.opacity;
		var cur_frame = this.curFrame;
		var spritesheeted = cur_frame.spritesheeted;
		var cur_image = cur_frame.texture_img;
		var myx = this.x;
		var myy = this.y;
		var w = this.width;
		var h = this.height;
		if (this.angle === 0 && w >= 0 && h >= 0)
		{
			myx -= this.hotspotX * w;
			myy -= this.hotspotY * h;
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			if (spritesheeted)
			{
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
										 myx, myy, w, h);
			}
			else
			{
				ctx.drawImage(cur_image, myx, myy, w, h);
			}
		}
		else
		{
			if (this.runtime.pixel_rounding)
			{
				myx = (myx + 0.5) | 0;
				myy = (myy + 0.5) | 0;
			}
			ctx.save();
			var widthfactor = w > 0 ? 1 : -1;
			var heightfactor = h > 0 ? 1 : -1;
			ctx.translate(myx, myy);
			if (widthfactor !== 1 || heightfactor !== 1)
				ctx.scale(widthfactor, heightfactor);
			ctx.rotate(this.angle * widthfactor * heightfactor);
			var drawx = 0 - (this.hotspotX * cr.abs(w))
			var drawy = 0 - (this.hotspotY * cr.abs(h));
			if (spritesheeted)
			{
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
										 drawx, drawy, cr.abs(w), cr.abs(h));
			}
			else
			{
				ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h));
			}
			ctx.restore();
		}
		/*
		ctx.strokeStyle = "#f00";
		ctx.lineWidth = 3;
		ctx.beginPath();
		this.collision_poly.cache_poly(this.width, this.height, this.angle);
		var i, len, ax, ay, bx, by;
		for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
		{
			ax = this.collision_poly.pts_cache[i*2] + this.x;
			ay = this.collision_poly.pts_cache[i*2+1] + this.y;
			bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
			by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
			ctx.moveTo(ax, ay);
			ctx.lineTo(bx, by);
		}
		ctx.stroke();
		ctx.closePath();
		*/
		/*
		if (this.behavior_insts.length >= 1 && this.behavior_insts[0].draw)
		{
			this.behavior_insts[0].draw(ctx);
		}
		*/
	};
	instanceProto.drawGL = function(glw)
	{
		glw.setTexture(this.curWebGLTexture);
		glw.setOpacity(this.opacity);
		var cur_frame = this.curFrame;
		var q = this.bquad;
		if (this.runtime.pixel_rounding)
		{
			var ox = ((this.x + 0.5) | 0) - this.x;
			var oy = ((this.y + 0.5) | 0) - this.y;
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
			else
				glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else
		{
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
			else
				glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
		}
	};
	instanceProto.getImagePointIndexByName = function(name_)
	{
		var cur_frame = this.curFrame;
		var i, len;
		for (i = 0, len = cur_frame.image_points.length; i < len; i++)
		{
			if (cr.equals_nocase(name_, cur_frame.image_points[i][0]))
				return i;
		}
		return -1;
	};
	instanceProto.getImagePoint = function(imgpt, getX)
	{
		var cur_frame = this.curFrame;
		var image_points = cur_frame.image_points;
		var index;
		if (cr.is_string(imgpt))
			index = this.getImagePointIndexByName(imgpt);
		else
			index = imgpt - 1;	// 0 is origin
		index = cr.floor(index);
		if (index < 0 || index >= image_points.length)
			return getX ? this.x : this.y;	// return origin
		var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
		var y = image_points[index][2];
		y = (y - cur_frame.hotspotY) * this.height;
		var cosa = Math.cos(this.angle);
		var sina = Math.sin(this.angle);
		var x_temp = (x * cosa) - (y * sina);
		y = (y * cosa) + (x * sina);
		x = x_temp;
		x += this.x;
		y += this.y;
		return getX ? x : y;
	};
	function Cnds() {};
	var arrCache = [];
	function allocArr()
	{
		if (arrCache.length)
			return arrCache.pop();
		else
			return [0, 0];
	};
	function freeArr(a)
	{
		a[0] = 0;
		a[1] = 0;
		arrCache.push(a);
	};
	function collmemory_add(collmemory, a, b)
	{
		var arr = allocArr();
		arr[0] = a.uid;
		arr[1] = b.uid;
		collmemory.push(arr);
	};
	function collmemory_remove(collmemory, a, b)
	{
;
		var a_uid = a.uid;
		var b_uid = b.uid;
		var i, j = 0, len, entry;
		for (i = 0, len = collmemory.length; i < len; i++)
		{
			entry = collmemory[i];
			if (!((entry[0] === a_uid && entry[1] === b_uid) || (entry[0] === b_uid && entry[1] === a_uid)))
			{
				collmemory[j][0] = collmemory[i][0];
				collmemory[j][1] = collmemory[i][1];
				j++;
			}
		}
		for (i = j; i < len; i++)
			freeArr(collmemory[i]);
		collmemory.length = j;
	};
	function collmemory_removeInstance(collmemory, inst)
	{
;
		var i, j = 0, len, entry, uid = inst.uid;
		for (i = 0, len = collmemory.length; i < len; i++)
		{
			entry = collmemory[i];
			if (entry[0] !== uid && entry[1] !== uid)
			{
				collmemory[j][0] = collmemory[i][0];
				collmemory[j][1] = collmemory[i][1];
				j++;
			}
		}
		for (i = j; i < len; i++)
			freeArr(collmemory[i]);
		collmemory.length = j;
	};
	function collmemory_has(collmemory, a, b)
	{
		var a_uid = a.uid;
		var b_uid = b.uid;
		var i, len, entry;
		for (i = 0, len = collmemory.length; i < len; i++)
		{
			entry = collmemory[i];
			if ((entry[0] === a_uid && entry[1] === b_uid) || (entry[0] === b_uid && entry[1] === a_uid))
				return true;
		}
		return false;
	};
	Cnds.prototype.OnCollision = function (rtype)
	{
		if (!rtype)
			return false;
		var runtime = this.runtime;
		var cnd = runtime.getCurrentCondition();
		var ltype = cnd.type;
		if (!cnd.extra.collmemory)
		{
			cnd.extra.collmemory = [];
			runtime.addDestroyCallback((function (collmemory) {
				return function(inst) {
					collmemory_removeInstance(collmemory, inst);
				};
			})(cnd.extra.collmemory));
		}
		var lsol = ltype.getCurrentSol();
		var rsol = rtype.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances = rsol.getObjects();
		var l, linst, r, rinst;
		var curlsol, currsol;
		var current_event = runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		for (l = 0; l < linstances.length; l++)
		{
			linst = linstances[l];
			for (r = 0; r < rinstances.length; r++)
			{
				rinst = rinstances[r];
				if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst))
				{
					if (!collmemory_has(cnd.extra.collmemory, linst, rinst))
					{
						collmemory_add(cnd.extra.collmemory, linst, rinst);
						runtime.pushCopySol(current_event.solModifiers);
						curlsol = ltype.getCurrentSol();
						currsol = rtype.getCurrentSol();
						curlsol.select_all = false;
						currsol.select_all = false;
						if (ltype === rtype)
						{
							curlsol.instances.length = 2;	// just use lsol, is same reference as rsol
							curlsol.instances[0] = linst;
							curlsol.instances[1] = rinst;
							ltype.applySolToContainer();
						}
						else
						{
							curlsol.instances.length = 1;
							currsol.instances.length = 1;
							curlsol.instances[0] = linst;
							currsol.instances[0] = rinst;
							ltype.applySolToContainer();
							rtype.applySolToContainer();
						}
						current_event.retrigger();
						runtime.popSol(current_event.solModifiers);
					}
				}
				else
				{
					collmemory_remove(cnd.extra.collmemory, linst, rinst);
				}
			}
		}
		return false;
	};
	var rpicktype = null;
	var rtopick = new cr.ObjectSet();
	var needscollisionfinish = false;
	function DoOverlapCondition(rtype, offx, offy)
	{
		if (!rtype)
			return false;
		var do_offset = (offx !== 0 || offy !== 0);
		var oldx, oldy, ret = false, r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;
		if (rsol.select_all)
			rinstances = rsol.type.instances;
		else if (orblock)
			rinstances = rsol.else_instances;
		else
			rinstances = rsol.instances;
		rpicktype = rtype;
		needscollisionfinish = (ltype !== rtype && !inverted);
		if (do_offset)
		{
			oldx = this.x;
			oldy = this.y;
			this.x += offx;
			this.y += offy;
			this.set_bbox_changed();
		}
		for (r = 0, lenr = rinstances.length; r < lenr; r++)
		{
			rinst = rinstances[r];
			if (this.runtime.testOverlap(this, rinst))
			{
				ret = true;
				if (inverted)
					break;
				if (ltype !== rtype)
					rtopick.add(rinst);
			}
		}
		if (do_offset)
		{
			this.x = oldx;
			this.y = oldy;
			this.set_bbox_changed();
		}
		return ret;
	};
	typeProto.finish = function (do_pick)
	{
		if (!needscollisionfinish)
			return;
		if (do_pick)
		{
			var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
			var sol = rpicktype.getCurrentSol();
			var topick = rtopick.valuesRef();
			var i, len, inst;
			if (sol.select_all)
			{
				sol.select_all = false;
				sol.instances.length = topick.length;
				for (i = 0, len = topick.length; i < len; i++)
				{
					sol.instances[i] = topick[i];
				}
				if (orblock)
				{
					sol.else_instances.length = 0;
					for (i = 0, len = rpicktype.instances.length; i < len; i++)
					{
						inst = rpicktype.instances[i];
						if (!rtopick.contains(inst))
							sol.else_instances.push(inst);
					}
				}
			}
			else
			{
				var initsize = sol.instances.length;
				sol.instances.length = initsize + topick.length;
				for (i = 0, len = topick.length; i < len; i++)
				{
					sol.instances[initsize + i] = topick[i];
					if (orblock)
						cr.arrayFindRemove(sol.else_instances, topick[i]);
				}
			}
			rpicktype.applySolToContainer();
		}
		rtopick.clear();
		needscollisionfinish = false;
	};
	Cnds.prototype.IsOverlapping = function (rtype)
	{
		return DoOverlapCondition.call(this, rtype, 0, 0);
	};
	Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy)
	{
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};
	Cnds.prototype.IsAnimPlaying = function (animname)
	{
		if (this.changeAnimName.length)
			return cr.equals_nocase(this.changeAnimName, animname);
		else
			return cr.equals_nocase(this.cur_animation.name, animname);
	};
	Cnds.prototype.CompareFrame = function (cmp, framenum)
	{
		return cr.do_cmp(this.cur_frame, cmp, framenum);
	};
	Cnds.prototype.OnAnimFinished = function (animname)
	{
		return cr.equals_nocase(this.animTriggerName, animname);
	};
	Cnds.prototype.OnAnyAnimFinished = function ()
	{
		return true;
	};
	Cnds.prototype.OnFrameChanged = function ()
	{
		return true;
	};
	Cnds.prototype.IsMirrored = function ()
	{
		return this.width < 0;
	};
	Cnds.prototype.IsFlipped = function ()
	{
		return this.height < 0;
	};
	Cnds.prototype.OnURLLoaded = function ()
	{
		return true;
	};
	Cnds.prototype.IsCollisionEnabled = function ()
	{
		return this.collisionsEnabled;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Spawn = function (obj, layer, imgpt)
	{
		if (!obj || !layer)
			return;
		var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
		if (!inst)
			return;
		if (typeof inst.angle !== "undefined")
		{
			inst.angle = this.angle;
			inst.set_bbox_changed();
		}
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained)
		{
			for (i = 0, len = inst.siblings.length; i < len; i++)
			{
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		this.runtime.isInOnDestroy--;
		var cur_act = this.runtime.getCurrentAction();
		var reset_sol = false;
		if (cr.is_undefined(cur_act.extra.Spawn_LastExec) || cur_act.extra.Spawn_LastExec < this.runtime.execcount)
		{
			reset_sol = true;
			cur_act.extra.Spawn_LastExec = this.runtime.execcount;
		}
		var sol;
		if (obj != this.type)
		{
			sol = obj.getCurrentSol();
			sol.select_all = false;
			if (reset_sol)
			{
				sol.instances.length = 1;
				sol.instances[0] = inst;
			}
			else
				sol.instances.push(inst);
			if (inst.is_contained)
			{
				for (i = 0, len = inst.siblings.length; i < len; i++)
				{
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					if (reset_sol)
					{
						sol.instances.length = 1;
						sol.instances[0] = s;
					}
					else
						sol.instances.push(s);
				}
			}
		}
	};
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.StopAnim = function ()
	{
		this.animPlaying = false;
	};
	Acts.prototype.StartAnim = function (from)
	{
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		if (from === 1 && this.cur_frame !== 0)
		{
			this.changeAnimFrame = 0;
			if (!this.inAnimTrigger)
				this.doChangeAnimFrame();
		}
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetAnim = function (animname, from)
	{
		this.changeAnimName = animname;
		this.changeAnimFrom = from;
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnim();
	};
	Acts.prototype.SetAnimFrame = function (framenumber)
	{
		this.changeAnimFrame = framenumber;
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnimFrame();
	};
	Acts.prototype.SetAnimSpeed = function (s)
	{
		this.cur_anim_speed = cr.abs(s);
		this.animForwards = (s >= 0);
		if (!this.isTicking)
		{
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetMirrored = function (m)
	{
		var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
		if (this.width === neww)
			return;
		this.width = neww;
		this.set_bbox_changed();
	};
	Acts.prototype.SetFlipped = function (f)
	{
		var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
		if (this.height === newh)
			return;
		this.height = newh;
		this.set_bbox_changed();
	};
	Acts.prototype.SetScale = function (s)
	{
		var cur_frame = this.curFrame;
		var mirror_factor = (this.width < 0 ? -1 : 1);
		var flip_factor = (this.height < 0 ? -1 : 1);
		var new_width = cur_frame.width * s * mirror_factor;
		var new_height = cur_frame.height * s * flip_factor;
		if (this.width !== new_width || this.height !== new_height)
		{
			this.width = new_width;
			this.height = new_height;
			this.set_bbox_changed();
		}
	};
	Acts.prototype.LoadURL = function (url_, resize_)
	{
		var img = new Image();
		var self = this;
		var curFrame_ = this.curFrame;
		img.onload = function ()
		{
			if (curFrame_.texture_img.src === img.src)
			{
				if (self.runtime.glwrap && self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				self.runtime.redraw = true;
				self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
				return;
			}
			curFrame_.texture_img = img;
			curFrame_.offx = 0;
			curFrame_.offy = 0;
			curFrame_.width = img.width;
			curFrame_.height = img.height;
			curFrame_.spritesheeted = false;
			curFrame_.datauri = "";
			if (self.runtime.glwrap)
			{
				if (curFrame_.webGL_texture)
					self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
				curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
				if (self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				self.type.updateAllCurrentTexture();
			}
			if (resize_ === 0)		// resize to image size
			{
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed();
			}
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
		};
		if (url_.substr(0, 5) !== "data:")
			img.crossOrigin = 'anonymous';
		img.src = url_;
	};
	Acts.prototype.SetCollisions = function (set_)
	{
		this.collisionsEnabled = (set_ !== 0);
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.AnimationFrame = function (ret)
	{
		ret.set_int(this.cur_frame);
	};
	Exps.prototype.AnimationFrameCount = function (ret)
	{
		ret.set_int(this.cur_animation.frames.length);
	};
	Exps.prototype.AnimationName = function (ret)
	{
		ret.set_string(this.cur_animation.name);
	};
	Exps.prototype.AnimationSpeed = function (ret)
	{
		ret.set_float(this.cur_anim_speed);
	};
	Exps.prototype.ImagePointX = function (ret, imgpt)
	{
		ret.set_float(this.getImagePoint(imgpt, true));
	};
	Exps.prototype.ImagePointY = function (ret, imgpt)
	{
		ret.set_float(this.getImagePoint(imgpt, false));
	};
	Exps.prototype.ImagePointCount = function (ret)
	{
		ret.set_int(this.curFrame.image_points.length);
	};
	Exps.prototype.ImageWidth = function (ret)
	{
		ret.set_float(this.curFrame.width);
	};
	Exps.prototype.ImageHeight = function (ret)
	{
		ret.set_float(this.curFrame.height);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Text = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Text.prototype;
	pluginProto.onCreate = function ()
	{
		pluginProto.acts.SetWidth = function (w)
		{
			if (this.width !== w)
			{
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
	};
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	typeProto.onLostWebGLContext = function ()
	{
		if (this.is_family)
			return;
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++)
		{
			inst = this.instances[i];
			inst.mycanvas = null;
			inst.myctx = null;
			inst.mytex = null;
		}
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		if (this.recycled)
			this.lines.length = 0;
		else
			this.lines = [];		// for word wrapping
		this.text_changed = true;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var requestedWebFonts = {};		// already requested web fonts have an entry here
	instanceProto.onCreate = function()
	{
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);		// 0=visible, 1=invisible
		this.font = this.properties[2];
		this.color = this.properties[3];
		this.halign = this.properties[4];				// 0=left, 1=center, 2=right
		this.valign = this.properties[5];				// 0=top, 1=center, 2=bottom
		this.wrapbyword = (this.properties[7] === 0);	// 0=word, 1=character
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
		this.line_height_offset = this.properties[8];
		this.facename = "";
		this.fontstyle = "";
		this.ptSize = 0;
		this.textWidth = 0;
		this.textHeight = 0;
		this.parseFont();
		this.mycanvas = null;
		this.myctx = null;
		this.mytex = null;
		this.need_text_redraw = false;
		this.last_render_tick = this.runtime.tickcount;
		if (this.recycled)
			this.rcTex.set(0, 0, 1, 1);
		else
			this.rcTex = new cr.rect(0, 0, 1, 1);
		if (this.runtime.glwrap)
			this.runtime.tickMe(this);
;
	};
	instanceProto.parseFont = function ()
	{
		var arr = this.font.split(" ");
		var i;
		for (i = 0; i < arr.length; i++)
		{
			if (arr[i].substr(arr[i].length - 2, 2) === "pt")
			{
				this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				if (i > 0)
					this.fontstyle = arr[i - 1];
				this.facename = arr[i + 1];
				for (i = i + 2; i < arr.length; i++)
					this.facename += " " + arr[i];
				break;
			}
		}
	};
	instanceProto.saveToJSON = function ()
	{
		return {
			"t": this.text,
			"f": this.font,
			"c": this.color,
			"ha": this.halign,
			"va": this.valign,
			"wr": this.wrapbyword,
			"lho": this.line_height_offset,
			"fn": this.facename,
			"fs": this.fontstyle,
			"ps": this.ptSize,
			"pxh": this.pxHeight,
			"tw": this.textWidth,
			"th": this.textHeight,
			"lrt": this.last_render_tick
		};
	};
	instanceProto.loadFromJSON = function (o)
	{
		this.text = o["t"];
		this.font = o["f"];
		this.color = o["c"];
		this.halign = o["ha"];
		this.valign = o["va"];
		this.wrapbyword = o["wr"];
		this.line_height_offset = o["lho"];
		this.facename = o["fn"];
		this.fontstyle = o["fs"];
		this.ptSize = o["ps"];
		this.pxHeight = o["pxh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.last_render_tick = o["lrt"];
		this.text_changed = true;
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
	};
	instanceProto.tick = function ()
	{
		if (this.runtime.glwrap && this.mytex && (this.runtime.tickcount - this.last_render_tick >= 300))
		{
			var layer = this.layer;
            this.update_bbox();
            var bbox = this.bbox;
            if (bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom)
			{
				this.runtime.glwrap.deleteTexture(this.mytex);
				this.mytex = null;
				this.myctx = null;
				this.mycanvas = null;
			}
		}
	};
	instanceProto.onDestroy = function ()
	{
		this.myctx = null;
		this.mycanvas = null;
		if (this.runtime.glwrap && this.mytex)
			this.runtime.glwrap.deleteTexture(this.mytex);
		this.mytex = null;
	};
	instanceProto.updateFont = function ()
	{
		this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
		this.text_changed = true;
		this.runtime.redraw = true;
	};
	instanceProto.draw = function(ctx, glmode)
	{
		ctx.font = this.font;
		ctx.textBaseline = "top";
		ctx.fillStyle = this.color;
		ctx.globalAlpha = glmode ? 1 : this.opacity;
		var myscale = 1;
		if (glmode)
		{
			myscale = this.layer.getScale();
			ctx.save();
			ctx.scale(myscale, myscale);
		}
		if (this.text_changed || this.width !== this.lastwrapwidth)
		{
			this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
		this.update_bbox();
		var penX = glmode ? 0 : this.bquad.tlx;
		var penY = glmode ? 0 : this.bquad.tly;
		if (this.runtime.pixel_rounding)
		{
			penX = (penX + 0.5) | 0;
			penY = (penY + 0.5) | 0;
		}
		if (this.angle !== 0 && !glmode)
		{
			ctx.save();
			ctx.translate(penX, penY);
			ctx.rotate(this.angle);
			penX = 0;
			penY = 0;
		}
		var endY = penY + this.height;
		var line_height = this.pxHeight;
		line_height += (this.line_height_offset * this.runtime.devicePixelRatio);
		var drawX;
		var i;
		if (this.valign === 1)		// center
			penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
		else if (this.valign === 2)	// bottom
			penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
		for (i = 0; i < this.lines.length; i++)
		{
			drawX = penX;
			if (this.halign === 1)		// center
				drawX = penX + (this.width - this.lines[i].width) / 2;
			else if (this.halign === 2)	// right
				drawX = penX + (this.width - this.lines[i].width);
			ctx.fillText(this.lines[i].text, drawX, penY);
			penY += line_height;
			if (penY >= endY - line_height)
				break;
		}
		if (this.angle !== 0 || glmode)
			ctx.restore();
		this.last_render_tick = this.runtime.tickcount;
	};
	instanceProto.drawGL = function(glw)
	{
		if (this.width < 1 || this.height < 1)
			return;
		var need_redraw = this.text_changed || this.need_text_redraw;
		this.need_text_redraw = false;
		var layer_scale = this.layer.getScale();
		var layer_angle = this.layer.getAngle();
		var rcTex = this.rcTex;
		var floatscaledwidth = layer_scale * this.width;
		var floatscaledheight = layer_scale * this.height;
		var scaledwidth = Math.ceil(floatscaledwidth);
		var scaledheight = Math.ceil(floatscaledheight);
		var windowWidth = this.runtime.width;
		var windowHeight = this.runtime.height;
		var halfw = windowWidth / 2;
		var halfh = windowHeight / 2;
		if (!this.myctx)
		{
			this.mycanvas = document.createElement("canvas");
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			this.lastwidth = scaledwidth;
			this.lastheight = scaledheight;
			need_redraw = true;
			this.myctx = this.mycanvas.getContext("2d");
		}
		if (scaledwidth !== this.lastwidth || scaledheight !== this.lastheight)
		{
			this.mycanvas.width = scaledwidth;
			this.mycanvas.height = scaledheight;
			if (this.mytex)
			{
				glw.deleteTexture(this.mytex);
				this.mytex = null;
			}
			need_redraw = true;
		}
		if (need_redraw)
		{
			this.myctx.clearRect(0, 0, scaledwidth, scaledheight);
			this.draw(this.myctx, true);
			if (!this.mytex)
				this.mytex = glw.createEmptyTexture(scaledwidth, scaledheight, this.runtime.linearSampling, this.runtime.isMobile);
			glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
		}
		this.lastwidth = scaledwidth;
		this.lastheight = scaledheight;
		glw.setTexture(this.mytex);
		glw.setOpacity(this.opacity);
		glw.resetModelView();
		glw.translate(-halfw, -halfh);
		glw.updateModelView();
		var q = this.bquad;
		var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true);
		var tly = this.layer.layerToCanvas(q.tlx, q.tly, false);
		var trx = this.layer.layerToCanvas(q.trx, q.try_, true);
		var try_ = this.layer.layerToCanvas(q.trx, q.try_, false);
		var brx = this.layer.layerToCanvas(q.brx, q.bry, true);
		var bry = this.layer.layerToCanvas(q.brx, q.bry, false);
		var blx = this.layer.layerToCanvas(q.blx, q.bly, true);
		var bly = this.layer.layerToCanvas(q.blx, q.bly, false);
		if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0))
		{
			var ox = ((tlx + 0.5) | 0) - tlx;
			var oy = ((tly + 0.5) | 0) - tly
			tlx += ox;
			tly += oy;
			trx += ox;
			try_ += oy;
			brx += ox;
			bry += oy;
			blx += ox;
			bly += oy;
		}
		if (this.angle === 0 && layer_angle === 0)
		{
			trx = tlx + scaledwidth;
			try_ = tly;
			brx = trx;
			bry = tly + scaledheight;
			blx = tlx;
			bly = bry;
			rcTex.right = 1;
			rcTex.bottom = 1;
		}
		else
		{
			rcTex.right = floatscaledwidth / scaledwidth;
			rcTex.bottom = floatscaledheight / scaledheight;
		}
		glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
		glw.resetModelView();
		glw.scale(layer_scale, layer_scale);
		glw.rotateZ(-this.layer.getAngle());
		glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
		glw.updateModelView();
		this.last_render_tick = this.runtime.tickcount;
	};
	var wordsCache = [];
	pluginProto.TokeniseWords = function (text)
	{
		wordsCache.length = 0;
		var cur_word = "";
		var ch;
		var i = 0;
		while (i < text.length)
		{
			ch = text.charAt(i);
			if (ch === "\n")
			{
				if (cur_word.length)
				{
					wordsCache.push(cur_word);
					cur_word = "";
				}
				wordsCache.push("\n");
				++i;
			}
			else if (ch === " " || ch === "\t" || ch === "-")
			{
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length)
			{
				cur_word += ch;
				i++;
			}
		}
		if (cur_word.length)
			wordsCache.push(cur_word);
	};
	var linesCache = [];
	function allocLine()
	{
		if (linesCache.length)
			return linesCache.pop();
		else
			return {};
	};
	function freeLine(l)
	{
		linesCache.push(l);
	};
	function freeAllLines(arr)
	{
		var i, len;
		for (i = 0, len = arr.length; i < len; i++)
		{
			freeLine(arr[i]);
		}
		arr.length = 0;
	};
	pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword)
	{
		if (!text || !text.length)
		{
			freeAllLines(lines);
			return;
		}
		if (width <= 2.0)
		{
			freeAllLines(lines);
			return;
		}
		if (text.length <= 100 && text.indexOf("\n") === -1)
		{
			var all_width = ctx.measureText(text).width;
			if (all_width <= width)
			{
				freeAllLines(lines);
				lines.push(allocLine());
				lines[0].text = text;
				lines[0].width = all_width;
				return;
			}
		}
		this.WrapText(text, lines, ctx, width, wrapbyword);
	};
	pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword)
	{
		var wordArray;
		if (wrapbyword)
		{
			this.TokeniseWords(text);	// writes to wordsCache
			wordArray = wordsCache;
		}
		else
			wordArray = text;
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		for (i = 0; i < wordArray.length; i++)
		{
			if (wordArray[i] === "\n")
			{
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				line = lines[lineIndex];
				line.text = cur_line;
				line.width = ctx.measureText(cur_line).width;
				lineIndex++;
				cur_line = "";
				continue;
			}
			prev_line = cur_line;
			cur_line += wordArray[i];
			line_width = ctx.measureText(cur_line).width;
			if (line_width >= width)
			{
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				line = lines[lineIndex];
				line.text = prev_line;
				line.width = ctx.measureText(prev_line).width;
				lineIndex++;
				cur_line = wordArray[i];
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
			}
		}
		if (cur_line.length)
		{
			if (lineIndex >= lines.length)
				lines.push(allocLine());
			line = lines[lineIndex];
			line.text = cur_line;
			line.width = ctx.measureText(cur_line).width;
			lineIndex++;
		}
		for (i = lineIndex; i < lines.length; i++)
			freeLine(lines[i]);
		lines.length = lineIndex;
	};
	function Cnds() {};
	Cnds.prototype.CompareText = function(text_to_compare, case_sensitive)
	{
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return cr.equals_nocase(this.text, text_to_compare);
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.SetText = function(param)
	{
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_set = param.toString();
		if (this.text !== text_to_set)
		{
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.AppendText = function(param)
	{
		if (cr.is_number(param))
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_append = param.toString();
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.SetFontFace = function (face_, style_)
	{
		var newstyle = "";
		switch (style_) {
		case 1: newstyle = "bold"; break;
		case 2: newstyle = "italic"; break;
		case 3: newstyle = "bold italic"; break;
		}
		if (face_ === this.facename && newstyle === this.fontstyle)
			return;		// no change
		this.facename = face_;
		this.fontstyle = newstyle;
		this.updateFont();
	};
	Acts.prototype.SetFontSize = function (size_)
	{
		if (this.ptSize === size_)
			return;
		this.ptSize = size_;
		this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
		this.updateFont();
	};
	Acts.prototype.SetFontColor = function (rgb)
	{
		var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
		if (newcolor === this.color)
			return;
		this.color = newcolor;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};
	Acts.prototype.SetWebFont = function (familyname_, cssurl_)
	{
		if (this.runtime.isDomFree)
		{
			cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
			return;		// DC todo
		}
		var self = this;
		var refreshFunc = (function () {
							self.runtime.redraw = true;
							self.text_changed = true;
						});
		if (requestedWebFonts.hasOwnProperty(cssurl_))
		{
			var newfacename = "'" + familyname_ + "'";
			if (this.facename === newfacename)
				return;	// no change
			this.facename = newfacename;
			this.updateFont();
			for (var i = 1; i < 10; i++)
			{
				setTimeout(refreshFunc, i * 100);
				setTimeout(refreshFunc, i * 1000);
			}
			return;
		}
		var wf = document.createElement("link");
		wf.href = cssurl_;
		wf.rel = "stylesheet";
		wf.type = "text/css";
		wf.onload = refreshFunc;
		document.getElementsByTagName('head')[0].appendChild(wf);
		requestedWebFonts[cssurl_] = true;
		this.facename = "'" + familyname_ + "'";
		this.updateFont();
		for (var i = 1; i < 10; i++)
		{
			setTimeout(refreshFunc, i * 100);
			setTimeout(refreshFunc, i * 1000);
		}
;
	};
	Acts.prototype.SetEffect = function (effect)
	{
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.Text = function(ret)
	{
		ret.set_string(this.text);
	};
	Exps.prototype.FaceName = function (ret)
	{
		ret.set_string(this.facename);
	};
	Exps.prototype.FaceSize = function (ret)
	{
		ret.set_int(this.ptSize);
	};
	Exps.prototype.TextWidth = function (ret)
	{
		var w = 0;
		var i, len, x;
		for (i = 0, len = this.lines.length; i < len; i++)
		{
			x = this.lines[i].width;
			if (w < x)
				w = x;
		}
		ret.set_int(w);
	};
	Exps.prototype.TextHeight = function (ret)
	{
		ret.set_int(this.lines.length * this.pxHeight);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Touch = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.Touch.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.touches = [];
		this.mouseDown = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var dummyoffset = {left: 0, top: 0};
	instanceProto.findTouch = function (id)
	{
		var i, len;
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			if (this.touches[i]["id"] === id)
				return i;
		}
		return -1;
	};
	var appmobi_accx = 0;
	var appmobi_accy = 0;
	var appmobi_accz = 0;
	function AppMobiGetAcceleration(evt)
	{
		appmobi_accx = evt.x;
		appmobi_accy = evt.y;
		appmobi_accz = evt.z;
	};
	var pg_accx = 0;
	var pg_accy = 0;
	var pg_accz = 0;
	function PhoneGapGetAcceleration(evt)
	{
		pg_accx = evt.x;
		pg_accy = evt.y;
		pg_accz = evt.z;
	};
	var theInstance = null;
	instanceProto.onCreate = function()
	{
		theInstance = this;
		this.isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		this.curTouchX = 0;
		this.curTouchY = 0;
		this.trigger_index = 0;
		this.trigger_id = 0;
		this.useMouseInput = (this.properties[0] !== 0);
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		var elem2 = document;
		if (this.runtime.isDirectCanvas)
			elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem2 = elem = window;
		var self = this;
		if (window.navigator["msPointerEnabled"])
		{
			elem.addEventListener("MSPointerDown",
				function(info) {
					self.onPointerStart(info);
				},
				false
			);
			elem.addEventListener("MSPointerMove",
				function(info) {
					self.onPointerMove(info);
				},
				false
			);
			elem2.addEventListener("MSPointerUp",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			elem2.addEventListener("MSPointerCancel",
				function(info) {
					self.onPointerEnd(info);
				},
				false
			);
			if (this.runtime.canvas)
			{
				this.runtime.canvas.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function(e) {
					e.preventDefault();
				}, false);
			}
		}
		else
		{
			elem.addEventListener("touchstart",
				function(info) {
					self.onTouchStart(info);
				},
				false
			);
			elem.addEventListener("touchmove",
				function(info) {
					self.onTouchMove(info);
				},
				false
			);
			elem2.addEventListener("touchend",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
			elem2.addEventListener("touchcancel",
				function(info) {
					self.onTouchEnd(info);
				},
				false
			);
		}
		if (this.isWindows8)
		{
			var win8accelerometerFn = function(e) {
					var reading = e["reading"];
					self.acc_x = reading["accelerationX"];
					self.acc_y = reading["accelerationY"];
					self.acc_z = reading["accelerationZ"];
				};
			var win8inclinometerFn = function(e) {
					var reading = e["reading"];
					self.orient_alpha = reading["yawDegrees"];
					self.orient_beta = reading["pitchDegrees"];
					self.orient_gamma = reading["rollDegrees"];
				};
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
            if (accelerometer)
			{
                accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn);
            }
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			if (inclinometer)
			{
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn);
			}
			document.addEventListener("visibilitychange", function(e) {
				if (document["hidden"] || document["msHidden"])
				{
					if (accelerometer)
						accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
				}
				else
				{
					if (accelerometer)
						accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.addEventListener("readingchanged", win8inclinometerFn);
				}
			}, false);
		}
		else
		{
			window.addEventListener("deviceorientation", function (eventData) {
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0;
			}, false);
			window.addEventListener("devicemotion", function (eventData) {
				if (eventData["accelerationIncludingGravity"])
				{
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"];
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"];
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"];
				}
				if (eventData["acceleration"])
				{
					self.acc_x = eventData["acceleration"]["x"];
					self.acc_y = eventData["acceleration"]["y"];
					self.acc_z = eventData["acceleration"]["z"];
				}
			}, false);
		}
		if (this.useMouseInput && !this.runtime.isDomFree)
		{
			jQuery(document).mousemove(
				function(info) {
					self.onMouseMove(info);
				}
			);
			jQuery(document).mousedown(
				function(info) {
					self.onMouseDown(info);
				}
			);
			jQuery(document).mouseup(
				function(info) {
					self.onMouseUp(info);
				}
			);
		}
		if (this.runtime.isAppMobi && !this.runtime.isDirectCanvas)
		{
			AppMobi["accelerometer"]["watchAcceleration"](AppMobiGetAcceleration, { "frequency": 40, "adjustForRotation": true });
		}
		if (this.runtime.isPhoneGap)
		{
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, { "frequency": 40 });
		}
		this.runtime.tick2Me(this);
	};
	instanceProto.onPointerMove = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		if (i >= 0)
		{
			var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
			var t = this.touches[i];
			if (nowtime - t.time < 2)
				return;
			t.lasttime = t.time;
			t.lastx = t.x;
			t.lasty = t.y;
			t.time = nowtime;
			t.x = info.pageX - offset.left;
			t.y = info.pageY - offset.top;
		}
	};
	instanceProto.onPointerStart = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		if (info.preventDefault)
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		this.touches.push({ time: nowtime,
							x: touchx,
							y: touchy,
							lasttime: nowtime,
							lastx: touchx,
							lasty: touchy,
							"id": info["pointerId"],
							startindex: this.trigger_index
						});
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
	};
	instanceProto.onPointerEnd = function (info)
	{
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"])
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		this.trigger_id = (i >= 0 ? this.touches[i]["id"] : -1);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
		if (i >= 0)
		{
			this.touches.splice(i, 1);
		}
	};
	instanceProto.onTouchMove = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var nowtime = cr.performance_now();
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			var j = this.findTouch(t["identifier"]);
			if (j >= 0)
			{
				var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
				u = this.touches[j];
				if (nowtime - u.time < 2)
					continue;
				u.lasttime = u.time;
				u.lastx = u.x;
				u.lasty = u.y;
				u.time = nowtime;
				u.x = t.pageX - offset.left;
				u.y = t.pageY - offset.top;
			}
		}
	};
	instanceProto.onTouchStart = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : jQuery(this.runtime.canvas).offset();
		var nowtime = cr.performance_now();
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j !== -1)
				continue;
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			this.touches.push({ time: nowtime,
								x: touchx,
								y: touchy,
								lasttime: nowtime,
								lastx: touchx,
								lasty: touchy,
								"id": t["identifier"],
								startindex: this.trigger_index
							});
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		}
	};
	instanceProto.onTouchEnd = function (info)
	{
		if (info.preventDefault)
			info.preventDefault();
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++)
		{
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j >= 0)
			{
				this.trigger_index = this.touches[j].startindex;
				this.trigger_id = this.touches[j]["id"];
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
				this.touches.splice(j, 1);
			}
		}
	};
	instanceProto.getAlpha = function ()
	{
		if (this.runtime.isAppMobi && this.orient_alpha === 0 && appmobi_accz !== 0)
			return appmobi_accz * 90;
		else if (this.runtime.isPhoneGap  && this.orient_alpha === 0 && pg_accz !== 0)
			return pg_accz * 90;
		else
			return this.orient_alpha;
	};
	instanceProto.getBeta = function ()
	{
		if (this.runtime.isAppMobi && this.orient_beta === 0 && appmobi_accy !== 0)
			return appmobi_accy * -90;
		else if (this.runtime.isPhoneGap  && this.orient_beta === 0 && pg_accy !== 0)
			return pg_accy * -90;
		else
			return this.orient_beta;
	};
	instanceProto.getGamma = function ()
	{
		if (this.runtime.isAppMobi && this.orient_gamma === 0 && appmobi_accx !== 0)
			return appmobi_accx * 90;
		else if (this.runtime.isPhoneGap  && this.orient_gamma === 0 && pg_accx !== 0)
			return pg_accx * 90;
		else
			return this.orient_gamma;
	};
	var noop_func = function(){};
	instanceProto.onMouseDown = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchStart(fakeinfo);
		this.mouseDown = true;
	};
	instanceProto.onMouseMove = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		if (!this.mouseDown)
			return;
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchMove(fakeinfo);
	};
	instanceProto.onMouseUp = function(info)
	{
		if (info.preventDefault && this.runtime.had_a_click)
			info.preventDefault();
		this.runtime.had_a_click = true;
		var t = { pageX: info.pageX, pageY: info.pageY, "identifier": 0 };
		var fakeinfo = { changedTouches: [t] };
		this.onTouchEnd(fakeinfo);
		this.mouseDown = false;
	};
	instanceProto.tick2 = function()
	{
		var i, len, t;
		var nowtime = cr.performance_now();
		for (i = 0, len = this.touches.length; i < len; i++)
		{
			t = this.touches[i];
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
		}
	};
	function Cnds() {};
	Cnds.prototype.OnTouchStart = function ()
	{
		return true;
	};
	Cnds.prototype.OnTouchEnd = function ()
	{
		return true;
	};
	Cnds.prototype.IsInTouch = function ()
	{
		return this.touches.length;
	};
	Cnds.prototype.OnTouchObject = function (type)
	{
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	Cnds.prototype.IsTouchingObject = function (type)
	{
		if (!type)
			return false;
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
		var touching = [];
		var i, leni, j, lenj;
		for (i = 0, leni = instances.length; i < leni; i++)
		{
			var inst = instances[i];
			inst.update_bbox();
			for (j = 0, lenj = this.touches.length; j < lenj; j++)
			{
				var touch = this.touches[j];
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				if (inst.contains_pt(px, py))
				{
					touching.push(inst);
					break;
				}
			}
		}
		if (touching.length)
		{
			sol.select_all = false;
			sol.instances = touching;
			return true;
		}
		else
			return false;
	};
	Cnds.prototype.CompareTouchSpeed = function (index, cmp, s)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
			return false;
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		var speed = 0;
		if (timediff > 0)
			speed = dist / timediff;
		return cr.do_cmp(speed, cmp, s);
	};
	Cnds.prototype.OrientationSupported = function ()
	{
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	Cnds.prototype.MotionSupported = function ()
	{
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};
	Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_)
	{
		var v = 0;
		if (orientation_ === 0)
			v = this.getAlpha();
		else if (orientation_ === 1)
			v = this.getBeta();
		else
			v = this.getGamma();
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_)
	{
		var v = 0;
		if (acceleration_ === 0)
			v = this.acc_g_x;
		else if (acceleration_ === 1)
			v = this.acc_g_y;
		else if (acceleration_ === 2)
			v = this.acc_g_z;
		else if (acceleration_ === 3)
			v = this.acc_x;
		else if (acceleration_ === 4)
			v = this.acc_y;
		else if (acceleration_ === 5)
			v = this.acc_z;
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.OnNthTouchStart = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.OnNthTouchEnd = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.HasNthTouch = function (touch_)
	{
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1;
	};
	pluginProto.cnds = new Cnds();
	function Exps() {};
	Exps.prototype.TouchCount = function (ret)
	{
		ret.set_int(this.touches.length);
	};
	Exps.prototype.X = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
			if (cr.is_undefined(layerparam))
			{
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxX = layer.parallaxX;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxX = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxX = oldParallaxX;
				layer.angle = oldAngle;
			}
			else
			{
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, true));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.XAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.XForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam)
	{
		if (this.touches.length)
		{
			var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
			if (cr.is_undefined(layerparam))
			{
				layer = this.runtime.getLayerByNumber(0);
				oldScale = layer.scale;
				oldZoomRate = layer.zoomRate;
				oldParallaxY = layer.parallaxY;
				oldAngle = layer.angle;
				layer.scale = this.runtime.running_layout.scale;
				layer.zoomRate = 1.0;
				layer.parallaxY = 1.0;
				layer.angle = this.runtime.running_layout.angle;
				ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				layer.scale = oldScale;
				layer.zoomRate = oldZoomRate;
				layer.parallaxY = oldParallaxY;
				layer.angle = oldAngle;
			}
			else
			{
				if (cr.is_number(layerparam))
					layer = this.runtime.getLayerByNumber(layerparam);
				else
					layer = this.runtime.getLayerByName(layerparam);
				if (layer)
					ret.set_float(layer.canvasToLayer(this.touches[0].x, this.touches[0].y, false));
				else
					ret.set_float(0);
			}
		}
		else
			ret.set_float(0);
	};
	Exps.prototype.YAt = function (ret, index, layerparam)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.YForID = function (ret, id, layerparam)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam))
		{
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = this.runtime.running_layout.scale;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = this.runtime.running_layout.angle;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else
		{
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].x);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteXAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].x);
	};
	Exps.prototype.AbsoluteXForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.x);
	};
	Exps.prototype.AbsoluteY = function (ret)
	{
		if (this.touches.length)
			ret.set_float(this.touches[0].y);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteYAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].y);
	};
	Exps.prototype.AbsoluteYForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.y);
	};
	Exps.prototype.SpeedAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.SpeedForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.AngleAt = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
		{
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
	};
	Exps.prototype.AngleForID = function (ret, id)
	{
		var index = this.findTouch(id);
		if (index < 0)
		{
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)));
	};
	Exps.prototype.Alpha = function (ret)
	{
		ret.set_float(this.getAlpha());
	};
	Exps.prototype.Beta = function (ret)
	{
		ret.set_float(this.getBeta());
	};
	Exps.prototype.Gamma = function (ret)
	{
		ret.set_float(this.getGamma());
	};
	Exps.prototype.AccelerationXWithG = function (ret)
	{
		ret.set_float(this.acc_g_x);
	};
	Exps.prototype.AccelerationYWithG = function (ret)
	{
		ret.set_float(this.acc_g_y);
	};
	Exps.prototype.AccelerationZWithG = function (ret)
	{
		ret.set_float(this.acc_g_z);
	};
	Exps.prototype.AccelerationX = function (ret)
	{
		ret.set_float(this.acc_x);
	};
	Exps.prototype.AccelerationY = function (ret)
	{
		ret.set_float(this.acc_y);
	};
	Exps.prototype.AccelerationZ = function (ret)
	{
		ret.set_float(this.acc_z);
	};
	Exps.prototype.TouchIndex = function (ret)
	{
		ret.set_int(this.trigger_index);
	};
	Exps.prototype.TouchID = function (ret)
	{
		ret.set_float(this.trigger_id);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.XML = function(runtime)
{
	this.runtime = runtime;
	if (this.runtime.isIE)
	{
		var x = {};
		window["XPathResult"] = x;
		x.NUMBER_TYPE = 1;
		x.STRING_TYPE = 2;
		x.UNORDERED_NODE_SNAPSHOT_TYPE = 6;
		x.ORDERED_NODE_SNAPSHOT_TYPE = 7;
	}
};
(function ()
{
	var pluginProto = cr.plugins_.XML.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		this.xmlDoc = null;
		this.nodeStack = [];
		if (this.runtime.isDomFree)
			cr.logexport("[Construct 2] The XML object is not supported on this platform.");
	};
	instanceProto.xpath_eval_one = function(xpath, result_type)
	{
		if (!this.xmlDoc)
			return;
		var root = this.nodeStack.length ? this.nodeStack[this.nodeStack.length - 1] : this.xmlDoc.documentElement;
		try {
			if (this.runtime.isIE)
				return root.selectSingleNode(xpath);
			else
				return this.xmlDoc.evaluate(xpath, root, null, result_type, null);
		}
		catch (e) { return null; }
	};
	instanceProto.xpath_eval_many = function(xpath, result_type)
	{
		if (!this.xmlDoc)
			return;
		var root = this.nodeStack.length ? this.nodeStack[this.nodeStack.length - 1] : this.xmlDoc.documentElement;
		try {
			if (this.runtime.isIE)
				return root.selectNodes(xpath);
			else
				return this.xmlDoc.evaluate(xpath, root, null, result_type, null);
		}
		catch (e) { return null; }
	};
	function Cnds() {};
	instanceProto.doForEachIteration = function (current_event, item)
	{
		this.nodeStack.push(item);
		this.runtime.pushCopySol(current_event.solModifiers);
		current_event.retrigger();
		this.runtime.popSol(current_event.solModifiers);
		this.nodeStack.pop();
	};
	Cnds.prototype.ForEach = function (xpath)
	{
		if (this.runtime.isDomFree)
			return false;
		var current_event = this.runtime.getCurrentEventStack().current_event;
		var result = this.xpath_eval_many(xpath, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
		var i, len, x;
		if (!result)
			return false;
		else
		{
			var current_loop = this.runtime.pushLoopStack();
			if (this.runtime.isIE)
			{
				for (i = 0, len = result.length; i < len; i++)
				{
					current_loop.index = i;
					this.doForEachIteration(current_event, result[i]);
				}
			}
			else
			{
				for (i = 0, len = result.snapshotLength; i < len; i++)
				{
					current_loop.index = i;
					this.doForEachIteration(current_event, result.snapshotItem(i));
				}
			}
			this.runtime.popLoopStack();
		}
		return false;
	};
	pluginProto.cnds = new Cnds();
	function Acts() {};
	Acts.prototype.Load = function (str)
	{
		if (this.runtime.isDomFree)
			return;
		var xml, tmp;
		var isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		try {
			if (isWindows8)
	        {
	            xml = new Windows["Data"]["Xml"]["Dom"]["XmlDocument"]()
	            xml["loadXml"](str);
	        }
			else if (this.runtime.isIE)
			{
				var versions = ["MSXML2.DOMDocument.6.0",
                        "MSXML2.DOMDocument.3.0",
                        "MSXML2.DOMDocument"];
				for (var i = 0; i < 3; i++){
					try {
						xml = new ActiveXObject(versions[i]);
						if (xml)
							break;
					} catch (ex){
						xml = null;
					}
				}
				if (xml)
				{
					xml.async = "false";
					xml["loadXML"](str);
				}
			}
			else {
				tmp = new DOMParser();
				xml = tmp.parseFromString(str, "text/xml");
			}
		} catch(e) {
			xml = null;
		}
		if (xml)
		{
			this.xmlDoc = xml;
			if (this.runtime.isIE && !isWindows8)
				this.xmlDoc["setProperty"]("SelectionLanguage","XPath");
		}
	};
	pluginProto.acts = new Acts();
	function Exps() {};
	Exps.prototype.NumberValue = function (ret, xpath)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_int(0);
			return;
		}
		var result = this.xpath_eval_one(xpath, XPathResult.NUMBER_TYPE);
		if (!result)
			ret.set_int(0);
		else if (this.runtime.isIE)
			ret.set_int(parseInt(result.nodeValue, 10));
		else
			ret.set_int(result.numberValue || 0);
	};
	Exps.prototype.StringValue = function (ret, xpath)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_string("");
			return;
		}
		var result;
		if (/firefox/i.test(navigator.userAgent))
		{
			result = this.xpath_eval_one(xpath, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE);
			if (!result)
				ret.set_string("");
			else
			{
				var i, len, totalstr = "";
				for (i = 0, len = result.snapshotLength; i < len; i++)
				{
					totalstr += result.snapshotItem(i).textContent;
				}
				ret.set_string(totalstr);
			}
		}
		else
		{
			result = this.xpath_eval_one(xpath, XPathResult.STRING_TYPE);
			if (!result)
				ret.set_string("");
			else if (this.runtime.isIE)
				ret.set_string(result.nodeValue || "");
			else
				ret.set_string(result.stringValue || "");
		}
	};
	Exps.prototype.NodeCount = function (ret, xpath)
	{
		if (this.runtime.isDomFree)
		{
			ret.set_int(0);
			return;
		}
		var result = this.xpath_eval_many(xpath, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE);
		if (!result)
			ret.set_int(0);
		else if (this.runtime.isIE)
			ret.set_int(result.length || 0);
		else
			ret.set_int(result.snapshotLength || 0);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.cjs = function(runtime)
{
	this.runtime = runtime;
};
(function ()
{
	var pluginProto = cr.plugins_.cjs.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function()
	{
		this.nameOfExternalScript = this.properties[0];
		this.returnValue= "";
		var myScriptTag=document.createElement('script');
		myScriptTag.setAttribute("type","text/javascript");
		myScriptTag.setAttribute("src", this.nameOfExternalScript);
		if (typeof myScriptTag != "undefined")
			document.getElementsByTagName("head")[0].appendChild(myScriptTag);
	};
	instanceProto.draw = function(ctx)
	{
	};
	pluginProto.cnds = {};
	var cnds = pluginProto.cnds;
	pluginProto.acts = {};
	var acts = pluginProto.acts;
	acts.ExecuteJS = function (myparam)
	{
		this.returnValue= "";
		try
		{
			this.returnValue= eval(myparam);
		} catch(err)
		{
			this.returnValue= err;
        }
	};
	pluginProto.exps = {};
	var exps = pluginProto.exps;
	exps.ReadExecutionReturn = function (ret)
	{
		ret.set_string(this.returnValue);
	};
}());
cr.getProjectModel = function() { return [
	null,
	"StartScreen",
	[
	[
		cr.plugins_.AJAX,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Audio,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.cjs,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Browser,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.CBhash,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Function,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Keyboard,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Mouse,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Rex_Date,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.Sprite,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false
	]
,	[
		cr.plugins_.Text,
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false
	]
,	[
		cr.plugins_.Touch,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
,	[
		cr.plugins_.XML,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false
	]
	],
	[
	[
		"t0",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			3,
			[
				[pathGame + "images/ball-sheet0.png", 5209, 0, 0, 50, 50, 1, 0.5, 0.5,[],[-0.34,-0.34,0,-0.5,0.34,-0.34,0.5,0,0.34,0.34,0,0.5,-0.34,0.34,-0.5,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		2,
		[]
	]
,	[
		"t1",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			true,
			0,
			0,
			false,
			48,
			[
				[pathGame + "images/goal-sheet0.png", 205470, 1, 1, 549, 183, 1, 0.500911, 1,[],[],0],
				[pathGame + "images/goal-sheet0.png", 205470, 1, 185, 549, 183, 1, 0.500911, 1,[],[],0],
				[pathGame + "images/goal-sheet0.png", 205470, 1, 369, 549, 183, 1, 0.500911, 1,[],[],0],
				[pathGame + "images/goal-sheet0.png", 205470, 1, 553, 549, 183, 1, 0.500911, 1,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		47,
		[]
	]
,	[
		"t2",
		cr.plugins_.Touch,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		112,
		[]
		,[0]
	]
,	[
		"t3",
		cr.plugins_.Keyboard,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		146,
		[]
		,[]
	]
,	[
		"t4",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			151,
			[
				[pathGame + "images/arrow-sheet0.png", 11856, 0, 0, 480, 732, 1, 0.5, 0.961749,[],[-0.191667,-0.759563,0,-0.920765,0.185417,-0.755465,0.197917,-0.461749,0.264583,-0.116121,0,0.0150273,-0.277083,-0.107924,-0.208333,-0.461749],0]
			]
			]
		],
		[
		],
		false,
		false,
		150,
		[]
	]
,	[
		"t5",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			210,
			[
				[pathGame + "images/goalborder-sheet0.png", 20283, 0, 0, 579, 198, 1, 0.500864, 1,[],[-0.500864,-1,0.499136,-1,0.499136,0,0.473229,0,0.473067,-0.938447,-0.475604,-0.939394,-0.476252,0,-0.500864,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		209,
		[]
	]
,	[
		"t6",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			263,
			[
				[pathGame + "images/goalkeeper-sheet0.png", 35625, 1, 1, 87, 185, 1, 0.494253, 0.918919,[],[],0],
				[pathGame + "images/goalkeeper-sheet0.png", 35625, 177, 1, 48, 240, 1, 0.479167, 0.8875,[],[-0.364584,-0.858333,0.260416,-0.877083,0.427083,-0.68125,0.4375,-0.341667,0.177083,0.0625,-0.40625,0.075,-0.302084,-0.316667,-0.348959,-0.664583],0],
				[pathGame + "images/goalkeeper-sheet0.png", 35625, 89, 1, 87, 185, 1, 0.494253, 0.918919,[],[],0],
				[pathGame + "images/goalkeeper-sheet1.png", 12400, 0, 0, 48, 240, 1, 0.479167, 0.8875,[],[-0.364584,-0.858333,0.260416,-0.877083,0.427083,-0.68125,0.4375,-0.341667,0.177083,0.0625,-0.40625,0.075,-0.302084,-0.316667,-0.348959,-0.664583],0]
			]
			]
		],
		[
		],
		false,
		false,
		262,
		[]
	]
,	[
		"t7",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			348,
			[
				[pathGame + "images/bg-sheet0.png", 769057, 0, 0, 900, 450, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		347,
		[]
	]
,	[
		"t8",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			371,
			[
				[pathGame + "images/gloves-sheet0.png", 2711, 0, 0, 42, 30, 1, 0.47619, 0.466667,[],[-0.386905,-0.341667,0.0238095,-0.116667,0.363096,-0.241667,0.505952,0.0333333,0.452381,0.433333,-0.315476,0.308333,-0.458333,0.0333333],0]
			]
			]
		],
		[
		],
		false,
		false,
		370,
		[]
	]
,	[
		"t9",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			599,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		598,
		[]
	]
,	[
		"t10",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			601,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		600,
		[]
	]
,	[
		"t11",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			603,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		602,
		[]
	]
,	[
		"t12",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			605,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		604,
		[]
	]
,	[
		"t13",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			607,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		606,
		[]
	]
,	[
		"t14",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			609,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		608,
		[]
	]
,	[
		"t15",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			611,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		610,
		[]
	]
,	[
		"t16",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			613,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		612,
		[]
	]
,	[
		"t17",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			615,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		614,
		[]
	]
,	[
		"t18",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			617,
			[
				[pathGame + "images/pr1-sheet0.png", 252, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet1.png", 348, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0],
				[pathGame + "images/pr1-sheet2.png", 337, 0, 0, 22, 22, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		616,
		[]
	]
,	[
		"t19",
		cr.plugins_.Function,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		621,
		[]
		,[]
	]
,	[
		"t20",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		738,
		[]
	]
,	[
		"t21",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		739,
		[]
	]
,	[
		"t22",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		740,
		[]
	]
,	[
		"t23",
		cr.plugins_.Rex_Date,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		750,
		[]
	]
,	[
		"t24",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			784,
			[
				[pathGame + "images/ad1-sheet0.png", 10882, 0, 0, 90, 60, 1, 0.533333, 0.483333,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		783,
		[]
	]
,	[
		"t25",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			786,
			[
				[pathGame + "images/ad2-sheet0.png", 12994, 0, 0, 90, 60, 1, 0.511111, 0.483333,[],[],0]
			]
			]
		],
		[
		],
		true,
		false,
		785,
		[]
	]
,	[
		"t26",
		cr.plugins_.AJAX,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		800,
		[]
		,[]
	]
,	[
		"t27",
		cr.plugins_.XML,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		801,
		[]
	]
,	[
		"t28",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			854,
			[
				[pathGame + "images/startbuttonbg-sheet0.png", 5569, 0, 0, 231, 65, 1, 0.497835, 0.492308,[],[-0.480519,-0.430769,-4.76837e-007,-0.461538,0.484849,-0.430769,0.497835,2.98023e-007,0.484849,0.446154,-4.76837e-007,0.476923,-0.480519,0.446154,-0.493506,2.98023e-007],0]
			]
			]
		],
		[
		],
		false,
		false,
		853,
		[]
	]
,	[
		"t29",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			859,
			[
				[pathGame + "images/startbuttonbg-sheet0.png", 5569, 0, 0, 231, 65, 1, 0.467532, 0.492308,[],[-0.450216,-0.430769,0.0303026,-0.461538,0.515152,-0.430769,0.528139,2.98023e-007,0.515152,0.446154,0.0303026,0.476923,-0.450216,0.446154,-0.463203,2.98023e-007],0]
			]
			]
		],
		[
		],
		false,
		false,
		858,
		[]
	]
,	[
		"t30",
		cr.plugins_.Text,
		false,
		[],
		0,
		2,
		null,
		null,
		[
		],
		false,
		false,
		860,
		[["glowhorizontal", "GlowHorizontal"],["glowvertical", "GlowVertical"]]
	]
,	[
		"t31",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		861,
		[]
	]
,	[
		"t32",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		862,
		[]
	]
,	[
		"t33",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		891,
		[]
	]
,	[
		"t34",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		892,
		[]
	]
,	[
		"t35",
		cr.plugins_.Text,
		false,
		[],
		0,
		1,
		null,
		null,
		[
		],
		false,
		false,
		920,
		[["hardlight", "HardLight"]]
	]
,	[
		"t36",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			951,
			[
				[pathGame + "images/penaltyspot-sheet0.png", 1071, 0, 0, 38, 20, 1, 0.5, 0.5,[],[],0]
			]
			]
		],
		[
		],
		false,
		false,
		950,
		[]
	]
,	[
		"t37",
		cr.plugins_.Audio,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		952,
		[]
		,[0,1,1,600,600,10000,1,5000,1]
	]
,	[
		"t38",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			1031,
			[
				[pathGame + "images/startbg-sheet0.png", 719745, 0, 0, 900, 450, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		1030,
		[]
	]
,	[
		"t39",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			5,
			false,
			1,
			0,
			false,
			1034,
			[
				[pathGame + "images/insrtbg-sheet0.png", 988252, 0, 0, 800, 600, 1, 0.5, 0.5,[],[],1]
			]
			]
		],
		[
		],
		false,
		false,
		1033,
		[]
	]
,	[
		"t40",
		cr.plugins_.Browser,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		1035,
		[]
		,[]
	]
,	[
		"t41",
		cr.plugins_.Text,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		1094,
		[]
	]
,	[
		"t42",
		cr.plugins_.Sprite,
		false,
		[],
		0,
		0,
		null,
		[
			[
			"Default",
			0,
			false,
			0,
			0,
			false,
			1101,
			[
				[pathGame + "images/soundsicon-sheet0.png", 1664, 0, 0, 38, 38, 1, 0.5, 0.5,[],[-0.34,-0.34,0,-0.5,0.34,-0.34,0.5,0,0.34,0.34,0,0.5,-0.34,0.34,-0.5,0],0],
				[pathGame + "images/soundsicon-sheet1.png", 1936, 0, 0, 38, 38, 1, 0.5, 0.5,[],[-0.34,-0.34,0,-0.5,0.34,-0.34,0.5,0,0.34,0.34,0,0.5,-0.34,0.34,-0.5,0],0]
			]
			]
		],
		[
		],
		false,
		false,
		1100,
		[]
	]
,	[
		"t43",
		cr.plugins_.cjs,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		true,
		false,
		1167,
		[]
	]
,	[
		"t44",
		cr.plugins_.CBhash,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		1172,
		[]
		,[]
	]
,	[
		"t45",
		cr.plugins_.Mouse,
		false,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		9157882085310644,
		[]
		,[]
	]
,	[
		"t46",
		cr.plugins_.Sprite,
		true,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		883,
		[]
	]
,	[
		"t47",
		cr.plugins_.Sprite,
		true,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		884,
		[]
	]
,	[
		"t48",
		cr.plugins_.Text,
		true,
		[],
		0,
		0,
		null,
		null,
		[
		],
		false,
		false,
		885,
		[]
	]
	],
	[
		[46,24,25]
,		[47,14,15,16,17,18,9,10,11,12,13]
,		[48,22,21]
	],
	[
	[
		"StartScreen",
		900,
		450,
		true,
		"Start events",
		847,
		[
		[
			"BG",
			0,
			1027,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[450, 225, 0, 900, 450, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				38,
				64,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"GUI",
			1,
			848,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[599, 377, 0, 231, 65, 0, 0, 1, 0.497835, 0.492308, 0, 0, []],
				28,
				46,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[281, 376, 0, 231, 65, 0, 0, 1, 0.467532, 0.492308, 0, 0, []],
				29,
				47,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[467.5, 120, 0, 635, 119, 0, 0, 1, 0.5, 0.5, 0, 0, [[1], [1]]],
				30,
				48,
				[
				],
				[
				],
				[
					"",
					0,
					"48pt Arial",
					"rgb(255,51,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[607, 377, 0, 228, 52, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				31,
				49,
				[
				],
				[
				],
				[
					"",
					0,
					"bold 12pt Arial",
					"rgb(0,0,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[289, 376, 0, 228, 52, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				32,
				50,
				[
				],
				[
				],
				[
					"",
					0,
					"bold 12pt Arial",
					"rgb(0,0,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[870, 420, 0, 38, 38, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				42,
				72,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
			[
				null,
				43,
				11,
				[
				],
				[
				],
				[
					""
				]
			]
		],
		[]
	]
,	[
		"Instructions",
		900,
		450,
		false,
		"Instructions e",
		849,
		[
		[
			"BG",
			0,
			1032,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[450, 225, 0, 900, 450, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				39,
				65,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"GUI",
			1,
			850,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[450, 43, 0, 367, 72, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				33,
				51,
				[
				],
				[
				],
				[
					"",
					0,
					"20pt Arial",
					"rgb(0,0,0)",
					0,
					1,
					1,
					0,
					0
				]
			]
,			[
				[119, 92, 0, 642, 259, 0, 0, 1, 0, 0, 0, 0, []],
				34,
				52,
				[
				],
				[
				],
				[
					"",
					0,
					"12pt Arial",
					"rgb(0,0,0)",
					0,
					0,
					0,
					0,
					0
				]
			]
,			[
				[767, 406, 0, 231, 65, 0, 0, 1, 0.497835, 0.492308, 0, 0, []],
				28,
				53,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[774.5, 405.5, 0, 225, 55, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				31,
				54,
				[
				],
				[
				],
				[
					"",
					0,
					"bold 12pt Arial",
					"rgb(0,0,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[811, 183, 0, 50, 50, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				0,
				67,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[812.829, 171.577, 0, 64, 98, 0, 0.426428, 1, 0.5, 0.961749, 0, 0, []],
				4,
				68,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[813, 300, 0, 42, 30, 0, 0, 1, 0.47619, 0.466667, 0, 0, []],
				8,
				69,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Kick",
		900,
		450,
		false,
		"Kick events",
		0,
		[
		[
			"Background",
			0,
			1,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[450, 225, 0, 900, 450, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				7,
				10,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 380, 0, 38, 20, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				36,
				61,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Ads",
			1,
			782,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[59, 116, 0, 90, 60, 0, 0, 1, 0.533333, 0.483333, 0, 0, []],
				24,
				20,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 116, 0, 90, 60, 0, 0, 1, 0.533333, 0.483333, 0, 0, []],
				24,
				33,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[245, 116, 0, 90, 60, 0, 0, 1, 0.511111, 0.483333, 0, 0, []],
				25,
				34,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[667, 116, 0, 90, 60, 0, 0, 1, 0.511111, 0.483333, 0, 0, []],
				25,
				35,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[847, 116, 0, 90, 60, 0, 0, 1, 0.533333, 0.483333, 0, 0, []],
				24,
				36,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Net",
			2,
			542,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[572, -195, 0, 549, 183, 0, 0, 0.4, 0.500911, 1, 0, 0, []],
				1,
				2,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Goal",
			3,
			271,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[-205, -263, 0, 579, 198, 0, 0, 1, 0.500864, 1, 0, 0, []],
				5,
				3,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-235, -244, 0, 87, 185, 0, 0, 1, 0.494253, 0.918919, 0, 0, []],
				6,
				9,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Ball",
			4,
			272,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[-200, 363, 0, 50, 50, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				0,
				0,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"GUI",
			5,
			273,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[36, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				9,
				17,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[60, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				10,
				23,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[84, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				11,
				24,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[108, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				12,
				25,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[132, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				13,
				26,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[767, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				14,
				27,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[791, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				15,
				28,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[815, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				16,
				29,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[839, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				17,
				30,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[863, 53, 0, 22, 22, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				18,
				31,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 250, 0, 956, 396, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				20,
				4,
				[
				],
				[
				],
				[
					"",
					1,
					"12pt Arial",
					"rgb(255,255,255)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[84, 29, 0, 118, 23, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				21,
				5,
				[
				],
				[
				],
				[
					"",
					0,
					"12pt Arial",
					"rgb(255,255,255)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[816, 29, 0, 118, 23, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				22,
				6,
				[
				],
				[
				],
				[
					"",
					0,
					"12pt Arial",
					"rgb(255,255,255)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[1089, -264, 0, 49, 133, 0, 0, 1, 0.5, 0.961749, 0, 0, []],
				4,
				8,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[872, 420, 0, 38, 38, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				42,
				73,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"DEBUG",
			6,
			274,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			],
			[			]
		]
		],
		[
			[
				null,
				23,
				19,
				[
				],
				[
				],
				[
				]
			]
,			[
				null,
				27,
				44,
				[
				],
				[
				],
				[
				]
			]
		],
		[]
	]
,	[
		"Defend",
		900,
		450,
		false,
		"Defend events",
		361,
		[
		[
			"Background",
			0,
			363,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[450, 225, 0, 900, 450, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				7,
				12,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 380, 0, 38, 20, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				36,
				62,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Goal",
			1,
			364,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[-411, 16, 0, 481.5, 196.5, 0, 0, 1, 0.500864, 1, 0, 0, []],
				5,
				13,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-437, -27, 0, 342.75, 127.5, 0, 0, 0.4, 0.500911, 1, 0, 0, []],
				1,
				14,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[208, -66, 0, 87, 185, 0, 0, 1, 0.494253, 0.918919, 0, 0, []],
				6,
				15,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Ball",
			2,
			365,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[928, -108, 0, 50, 50, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				0,
				16,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"GUI",
			3,
			366,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[594, 170, 0, 42, 30, 0, 0, 1, 0.47619, 0.466667, 0, 0, []],
				8,
				18,
				[
				],
				[
				],
				[
					1,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 250, 0, 231, 65, 0, 0, 1, 0.497835, 0.492308, 0, 0, []],
				28,
				70,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 250, 0, 231, 60, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				41,
				71,
				[
				],
				[
				],
				[
					"",
					0,
					"bold 12pt Arial",
					"rgb(0,0,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[872, 420, 0, 38, 38, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				42,
				74,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"DEBUG",
			4,
			367,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			],
			[			]
		]
		],
		[
		],
		[]
	]
,	[
		"Results",
		900,
		450,
		false,
		"Results events",
		851,
		[
		[
			"Background",
			0,
			852,
			true,
			[255, 255, 255],
			false,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[450, 225, 0, 900, 450, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				7,
				58,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[450, 375, 0, 38, 20, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				36,
				37,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"Goal",
			1,
			947,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[729.5, -18, 0, 567.647, 159.703, 0, 0, 0.4, 0.500911, 1, 0, 0, []],
				1,
				59,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[-47.5, -86, 0, 481.5, 196.5, 0, 0, 1, 0.500864, 1, 0, 0, []],
				5,
				60,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
			],
			[			]
		]
,		[
			"GUI",
			2,
			940,
			true,
			[255, 255, 255],
			true,
			1,
			1,
			1,
			false,
			1,
			0,
			0,
			[
			[
				[766, 405, 0, 231, 65, 0, 0, 1, 0.497835, 0.492308, 0, 0, []],
				28,
				56,
				[
				],
				[
				],
				[
					0,
					"Default",
					0,
					1
				]
			]
,			[
				[774, 405, 0, 225, 55, 0, 0, 1, 0.5, 0.5, 0, 0, []],
				31,
				57,
				[
				],
				[
				],
				[
					"",
					0,
					"bold 12pt Arial",
					"rgb(0,0,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
,			[
				[450, 240, 0, 665, 113, 0, 0, 1, 0.5, 0.5, 0, 0, [[]]],
				35,
				55,
				[
				],
				[
				],
				[
					"Text",
					0,
					"28pt Arial",
					"rgb(255,51,0)",
					1,
					1,
					1,
					0,
					0
				]
			]
			],
			[			]
		]
		],
		[
		],
		[]
	]
	],
	[
	[
		"Kick events",
		[
		[
			1,
			"cameraHeight",
			0,
			350,
false,false,95
		]
,		[
			1,
			"db",
			0,
			-80,
false,false,99
		]
,		[
			1,
			"dispz",
			0,
			1500,
false,false,86
		]
,		[
			1,
			"az",
			0,
			0,
false,false,8
		]
,		[
			1,
			"ay",
			0,
			-980,
false,false,5
		]
,		[
			1,
			"goalWidth",
			0,
			680,
false,false,67
		]
,		[
			1,
			"goalHeight",
			0,
			244,
false,false,52
		]
,		[
			1,
			"goalBarWidth",
			0,
			20,
false,false,211
		]
,		[
			1,
			"goalBarHeight",
			0,
			20,
false,false,212
		]
,		[
			1,
			"ballSize",
			0,
			33,
false,false,97
		]
,		[
			1,
			"yOffset",
			0,
			0,
false,false,111
		]
,		[
			1,
			"maxStrength",
			0,
			200,
false,false,208
		]
,		[
			1,
			"goalKeeperWidth",
			0,
			87,
false,false,265
		]
,		[
			1,
			"goalKeeperHeight",
			0,
			185,
false,false,264
		]
,		[
			1,
			"goalKeeperMaxSpeed",
			0,
			150,
false,false,324
		]
,		[
			1,
			"gkvx",
			0,
			0,
false,false,308
		]
,		[
			1,
			"gkvy",
			0,
			0,
false,false,309
		]
,		[
			1,
			"gkx",
			0,
			0,
false,false,311
		]
,		[
			1,
			"gky",
			0,
			0,
false,false,312
		]
,		[
			1,
			"pgkx",
			0,
			0,
false,false,319
		]
,		[
			1,
			"pgky",
			0,
			0,
false,false,320
		]
,		[
			1,
			"moving",
			0,
			0,
false,false,11
		]
,		[
			1,
			"vx",
			0,
			0,
false,false,75
		]
,		[
			1,
			"vy",
			0,
			0,
false,false,24
		]
,		[
			1,
			"vz",
			0,
			0,
false,false,25
		]
,		[
			1,
			"x",
			0,
			0,
false,false,74
		]
,		[
			1,
			"y",
			0,
			0,
false,false,10
		]
,		[
			1,
			"z",
			0,
			0,
false,false,9
		]
,		[
			1,
			"py",
			0,
			0,
false,false,84
		]
,		[
			1,
			"px",
			0,
			0,
false,false,83
		]
,		[
			1,
			"touchOriginY",
			0,
			0,
false,false,120
		]
,		[
			1,
			"touchOriginX",
			0,
			0,
false,false,119
		]
,		[
			1,
			"touchY",
			0,
			0,
false,false,133
		]
,		[
			1,
			"touchX",
			0,
			0,
false,false,132
		]
,		[
			1,
			"aimStarted",
			0,
			0,
false,false,124
		]
,		[
			1,
			"goalDist",
			0,
			0,
false,false,40
		]
,		[
			1,
			"strength",
			0,
			0,
false,false,131
		]
,		[
			1,
			"dx",
			0,
			0,
false,false,158
		]
,		[
			1,
			"dy",
			0,
			0,
false,false,159
		]
,		[
			1,
			"gotResult",
			0,
			0,
false,false,249
		]
,		[
			1,
			"myround",
			0,
			1,
false,false,618
		]
,		[
			1,
			"oscore",
			0,
			0,
false,false,620
		]
,		[
			1,
			"pscore",
			0,
			0,
false,false,619
		]
,		[
			1,
			"gTextOn",
			0,
			0,
false,false,747
		]
,		[
			1,
			"gTextTime",
			0,
			2,
false,false,756
		]
,		[
			1,
			"gTextStart",
			0,
			0,
false,false,751
		]
,		[
			1,
			"roundEnded",
			0,
			0,
false,false,1080
		]
,		[
			0,
			null,
			false,
			60,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false,
				61
			]
			],
			[
			[
				21,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				1182
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/player/text()"
						]
						]
					]
				]
				]
			]
,			[
				22,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				1183
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/computer/text()"
						]
						]
					]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Stop,
				null,
				966
				,[
				[
					1,
					[
						2,
						"goal"
					]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Stop,
				null,
				967
				,[
				[
					1,
					[
						2,
						"missed"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				732
				,[
				[
					11,
					"aimStarted"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				733
				,[
				[
					11,
					"moving"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				734
				,[
				[
					11,
					"gotResult"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				735
				,[
				[
					11,
					"x"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				96
				,[
				[
					11,
					"y"
				]
,				[
					7,
					[
						3,
						[
							23,
							"cameraHeight"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				100
				,[
				[
					11,
					"z"
				]
,				[
					7,
					[
						4,
						[
							23,
							"dispz"
						]
						,[
							23,
							"db"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				101
				,[
				[
					11,
					"goalDist"
				]
,				[
					7,
					[
						4,
						[
							4,
							[
								23,
								"dispz"
							]
							,[
								23,
								"db"
							]
						]
						,[
							0,
							1350
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				215
				,[
				[
					0,
					[
						6,
						[
							23,
							"goalWidth"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"goalHeight"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetPos,
				null,
				267
				,[
				[
					0,
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.layoutwidth
						]
						,[
							0,
							2
						]
					]
				]
,				[
					0,
					[
						5,
						[
							6,
							[
								23,
								"cameraHeight"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
						,[
							23,
							"yOffset"
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.StopAnim,
				null,
				543
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				544
				,[
				[
					0,
					[
						0,
						0
					]
				]
				]
			]
,			[
				5,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				216
				,[
				[
					0,
					[
						6,
						[
							4,
							[
								6,
								[
									23,
									"goalBarWidth"
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"goalWidth"
							]
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							4,
							[
								23,
								"goalBarHeight"
							]
							,[
								23,
								"goalHeight"
							]
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				5,
				cr.plugins_.Sprite.prototype.acts.SetPosToObject,
				null,
				268
				,[
				[
					4,
					1
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				6,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				270
				,[
				[
					0,
					[
						6,
						[
							23,
							"goalKeeperWidth"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"goalKeeperHeight"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				6,
				cr.plugins_.Sprite.prototype.acts.SetPosToObject,
				null,
				269
				,[
				[
					4,
					1
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				6,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				539
				,[
				[
					0,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				283
				,[
				[
					11,
					"px"
				]
,				[
					7,
					[
						6,
						[
							23,
							"x"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				284
				,[
				[
					11,
					"py"
				]
,				[
					7,
					[
						6,
						[
							23,
							"y"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
				]
			]
,			[
				0,
				cr.plugins_.Sprite.prototype.acts.SetY,
				null,
				285
				,[
				[
					0,
					[
						5,
						[
							3,
							[
								23,
								"py"
							]
						]
						,[
							23,
							"yOffset"
						]
					]
				]
				]
			]
,			[
				0,
				cr.plugins_.Sprite.prototype.acts.SetX,
				null,
				286
				,[
				[
					0,
					[
						4,
						[
							7,
							[
								19,
								cr.system_object.prototype.exps.layoutwidth
							]
							,[
								0,
								2
							]
						]
						,[
							23,
							"px"
						]
					]
				]
				]
			]
,			[
				0,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				287
				,[
				[
					0,
					[
						6,
						[
							23,
							"ballSize"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"ballSize"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				313
				,[
				[
					11,
					"gkx"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				314
				,[
				[
					11,
					"gky"
				]
,				[
					7,
					[
						3,
						[
							23,
							"cameraHeight"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1081
				,[
				[
					11,
					"roundEnded"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				42,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				1144
				,[
				[
					0,
					[
						23,
						"noSounds"
					]
				]
				]
			]
,			[
				19,
				cr.plugins_.Function.prototype.acts.CallFunction,
				null,
				741
				,[
				[
					1,
					[
						2,
						"growText"
					]
				]
,				[
					13,
											[
							7,
							[
								10,
								[
									10,
									[
										23,
										"txtRound"
									]
									,[
										2,
										" "
									]
								]
								,[
									23,
									"myround"
								]
							]
						]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Aiming"],
			false,
			207,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				207
				,[
				[
					1,
					[
						2,
						"Aiming"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				[true, "TOUCH"],
				false,
				3992040882468238,
				[
				[
					-1,
					cr.system_object.prototype.cnds.IsGroupActive,
					null,
					0,
					false,
					false,
					false,
					3992040882468238
					,[
					[
						1,
						[
							2,
							"TOUCH"
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					114,
					[
					[
						2,
						cr.plugins_.Touch.prototype.cnds.OnTouchObject,
						null,
						1,
						false,
						false,
						false,
						115
						,[
						[
							4,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						116
						,[
						[
							11,
							"moving"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						357
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.Play,
						null,
						975
						,[
						[
							2,
							["whistle",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
,						[
							1,
							[
								2,
								""
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						125
						,[
						[
							11,
							"aimStarted"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						152
						,[
						[
							3,
							1
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						121
						,[
						[
							11,
							"touchOriginX"
						]
,						[
							7,
							[
								20,
								2,
								cr.plugins_.Touch.prototype.exps.X,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						122
						,[
						[
							11,
							"touchOriginY"
						]
,						[
							7,
							[
								20,
								2,
								cr.plugins_.Touch.prototype.exps.Y,
								false,
								null
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetX,
						null,
						153
						,[
						[
							0,
							[
								23,
								"touchOriginX"
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetY,
						null,
						154
						,[
						[
							0,
							[
								23,
								"touchOriginY"
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					134,
					[
					[
						2,
						cr.plugins_.Touch.prototype.cnds.IsInTouch,
						null,
						0,
						false,
						false,
						false,
						135
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						140
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						136
						,[
						[
							11,
							"touchX"
						]
,						[
							7,
							[
								20,
								2,
								cr.plugins_.Touch.prototype.exps.X,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						137
						,[
						[
							11,
							"touchY"
						]
,						[
							7,
							[
								20,
								2,
								cr.plugins_.Touch.prototype.exps.Y,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						161
						,[
						[
							11,
							"dy"
						]
,						[
							7,
							[
								5,
								[
									23,
									"touchY"
								]
								,[
									23,
									"touchOriginY"
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						160
						,[
						[
							11,
							"dx"
						]
,						[
							7,
							[
								5,
								[
									23,
									"touchX"
								]
								,[
									23,
									"touchOriginX"
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						138
						,[
						[
							11,
							"strength"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.min
								,[
[
									23,
									"maxStrength"
								]
,[
									19,
									cr.system_object.prototype.exps.sqrt
									,[
[
										4,
										[
											9,
											[
												23,
												"dx"
											]
											,[
												0,
												2
											]
										]
										,[
											9,
											[
												23,
												"dy"
											]
											,[
												0,
												2
											]
										]
									]
									]
								]
								]
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetHeight,
						null,
						155
						,[
						[
							0,
							[
								23,
								"strength"
							]
						]
						]
					]
					]
					,[
					[
						0,
						null,
						false,
						174,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							172
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								4
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						]
						,[
						[
							0,
							null,
							false,
							165,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								166
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									2
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								156
								,[
								[
									0,
									[
										5,
										[
											0,
											90
										]
										,[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													3,
													[
														23,
														"dx"
													]
												]
											]
											]
										]
									]
								]
								]
							]
							]
						]
,						[
							0,
							null,
							false,
							167,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								170
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									4
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								169
								,[
								[
									0,
									[
										5,
										[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													23,
													"dx"
												]
											]
											]
										]
										,[
											0,
											90
										]
									]
								]
								]
							]
							]
						]
						]
					]
,					[
						0,
						null,
						false,
						194,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							195
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								2
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						]
						,[
						[
							0,
							null,
							false,
							196,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								197
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									2
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								198
								,[
								[
									0,
									[
										5,
										[
											0,
											270
										]
										,[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													3,
													[
														23,
														"dx"
													]
												]
											]
											]
										]
									]
								]
								]
							]
							]
						]
,						[
							0,
							null,
							false,
							199,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								200
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									4
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								201
								,[
								[
									0,
									[
										5,
										[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													23,
													"dx"
												]
											]
											]
										]
										,[
											0,
											270
										]
									]
								]
								]
							]
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					823,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						6827060273151482
						,[
						[
							11,
							"touchGame"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						2,
						cr.plugins_.Touch.prototype.cnds.IsInTouch,
						null,
						0,
						false,
						true,
						false,
						824
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						825
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						826
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.cnds.CompareHeight,
						null,
						0,
						false,
						false,
						false,
						827
						,[
						[
							8,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						828
						,[
						[
							11,
							"aimStarted"
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					126,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						9339470835835488
						,[
						[
							11,
							"touchGame"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						2,
						cr.plugins_.Touch.prototype.cnds.IsInTouch,
						null,
						0,
						false,
						true,
						false,
						128
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						129
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						358
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false,
						130
					]
					],
					[
					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						157
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						143
						,[
						[
							11,
							"vz"
						]
,						[
							7,
							[
								6,
								[
									23,
									"strength"
								]
								,[
									0,
									20
								]
							]
						]
						]
					]
					]
					,[
					[
						0,
						null,
						false,
						186,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							187
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								5
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							144
							,[
							[
								11,
								"vx"
							]
,							[
								7,
								[
									6,
									[
										3,
										[
											23,
											"dx"
										]
									]
									,[
										0,
										8
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							145
							,[
							[
								11,
								"vy"
							]
,							[
								7,
								[
									6,
									[
										19,
										cr.system_object.prototype.exps.abs
										,[
[
											5,
											[
												5,
												[
													20,
													0,
													cr.plugins_.Sprite.prototype.exps.Y,
													false,
													null
												]
												,[
													20,
													0,
													cr.plugins_.Sprite.prototype.exps.Height,
													false,
													null
												]
											]
											,[
												23,
												"touchOriginY"
											]
										]
										]
									]
									,[
										7,
										[
											23,
											"strength"
										]
										,[
											0,
											5
										]
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							346
							,[
							[
								11,
								"gkvy"
							]
,							[
								7,
								[
									19,
									cr.system_object.prototype.exps.min
									,[
[
										23,
										"vy"
									]
,[
										6,
										[
											23,
											"goalKeeperMaxSpeed"
										]
										,[
											0,
											3
										]
									]
									]
								]
							]
							]
						]
,						[
							37,
							cr.plugins_.Audio.prototype.acts.Play,
							null,
							957
							,[
							[
								2,
								["ballkick",false]
							]
,							[
								3,
								0
							]
,							[
								0,
								[
									0,
									0
								]
							]
,							[
								1,
								[
									2,
									"ballkick"
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							16
							,[
							[
								11,
								"moving"
							]
,							[
								7,
								[
									0,
									1
								]
							]
							]
						]
,						[
							6,
							cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
							null,
							1159
							,[
							[
								0,
								[
									0,
									1
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							1024
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						]
						,[
						[
							0,
							null,
							false,
							1019,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								1020
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									1
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								325
								,[
								[
									11,
									"gkvx"
								]
,								[
									7,
									[
										6,
										[
											7,
											[
												23,
												"vx"
											]
											,[
												19,
												cr.system_object.prototype.exps.abs
												,[
[
													23,
													"vx"
												]
												]
											]
										]
										,[
											19,
											cr.system_object.prototype.exps.min
											,[
[
												6,
												[
													19,
													cr.system_object.prototype.exps.abs
													,[
[
														23,
														"vx"
													]
													]
												]
												,[
													1,
													0.75
												]
											]
,[
												23,
												"goalKeeperMaxSpeed"
											]
											]
										]
									]
								]
								]
							]
							]
						]
						]
					]
,					[
						0,
						null,
						false,
						178,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							179
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								2
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							204
							,[
							[
								11,
								"vx"
							]
,							[
								7,
								[
									6,
									[
										23,
										"dx"
									]
									,[
										0,
										8
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							205
							,[
							[
								11,
								"vy"
							]
,							[
								7,
								[
									6,
									[
										19,
										cr.system_object.prototype.exps.abs
										,[
[
											5,
											[
												5,
												[
													20,
													0,
													cr.plugins_.Sprite.prototype.exps.Y,
													false,
													null
												]
												,[
													7,
													[
														20,
														0,
														cr.plugins_.Sprite.prototype.exps.Height,
														false,
														null
													]
													,[
														0,
														2
													]
												]
											]
											,[
												23,
												"touchOriginY"
											]
										]
										]
									]
									,[
										7,
										[
											23,
											"strength"
										]
										,[
											0,
											5
										]
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							344
							,[
							[
								11,
								"gkvy"
							]
,							[
								7,
								[
									19,
									cr.system_object.prototype.exps.min
									,[
[
										23,
										"vy"
									]
,[
										6,
										[
											23,
											"goalKeeperMaxSpeed"
										]
										,[
											0,
											3
										]
									]
									]
								]
							]
							]
						]
,						[
							37,
							cr.plugins_.Audio.prototype.acts.Play,
							null,
							958
							,[
							[
								2,
								["ballkick",false]
							]
,							[
								3,
								0
							]
,							[
								0,
								[
									0,
									0
								]
							]
,							[
								1,
								[
									2,
									"ballkick"
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							206
							,[
							[
								11,
								"moving"
							]
,							[
								7,
								[
									0,
									1
								]
							]
							]
						]
,						[
							6,
							cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
							null,
							1158
							,[
							[
								0,
								[
									0,
									1
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							1025
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						]
						,[
						[
							0,
							null,
							false,
							1021,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								1022
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									1
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								317
								,[
								[
									11,
									"gkvx"
								]
,								[
									7,
									[
										6,
										[
											7,
											[
												23,
												"vx"
											]
											,[
												19,
												cr.system_object.prototype.exps.abs
												,[
[
													23,
													"vx"
												]
												]
											]
										]
										,[
											19,
											cr.system_object.prototype.exps.min
											,[
[
												6,
												[
													19,
													cr.system_object.prototype.exps.abs
													,[
[
														23,
														"vx"
													]
													]
												]
												,[
													1,
													0.75
												]
											]
,[
												23,
												"goalKeeperMaxSpeed"
											]
											]
										]
									]
								]
								]
							]
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				[true, "MOUSE"],
				false,
				2296845290136825,
				[
				[
					-1,
					cr.system_object.prototype.cnds.IsGroupActive,
					null,
					0,
					false,
					false,
					false,
					2296845290136825
					,[
					[
						1,
						[
							2,
							"MOUSE"
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					114,
					[
					[
						45,
						cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
						null,
						1,
						false,
						false,
						false,
						115
						,[
						[
							3,
							0
						]
,						[
							3,
							0
						]
,						[
							4,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						116
						,[
						[
							11,
							"moving"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						357
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.Play,
						null,
						975
						,[
						[
							2,
							["whistle",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
,						[
							1,
							[
								2,
								""
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						125
						,[
						[
							11,
							"aimStarted"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						152
						,[
						[
							3,
							1
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						121
						,[
						[
							11,
							"touchOriginX"
						]
,						[
							7,
							[
								20,
								45,
								cr.plugins_.Mouse.prototype.exps.X,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						122
						,[
						[
							11,
							"touchOriginY"
						]
,						[
							7,
							[
								20,
								45,
								cr.plugins_.Mouse.prototype.exps.Y,
								false,
								null
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetX,
						null,
						153
						,[
						[
							0,
							[
								23,
								"touchOriginX"
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetY,
						null,
						154
						,[
						[
							0,
							[
								23,
								"touchOriginY"
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					134,
					[
					[
						45,
						cr.plugins_.Mouse.prototype.cnds.IsButtonDown,
						null,
						0,
						false,
						false,
						false,
						8656668872612735
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						140
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						136
						,[
						[
							11,
							"touchX"
						]
,						[
							7,
							[
								20,
								45,
								cr.plugins_.Mouse.prototype.exps.X,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						137
						,[
						[
							11,
							"touchY"
						]
,						[
							7,
							[
								20,
								45,
								cr.plugins_.Mouse.prototype.exps.Y,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						161
						,[
						[
							11,
							"dy"
						]
,						[
							7,
							[
								5,
								[
									23,
									"touchY"
								]
								,[
									23,
									"touchOriginY"
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						160
						,[
						[
							11,
							"dx"
						]
,						[
							7,
							[
								5,
								[
									23,
									"touchX"
								]
								,[
									23,
									"touchOriginX"
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						138
						,[
						[
							11,
							"strength"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.min
								,[
[
									23,
									"maxStrength"
								]
,[
									19,
									cr.system_object.prototype.exps.sqrt
									,[
[
										4,
										[
											9,
											[
												23,
												"dx"
											]
											,[
												0,
												2
											]
										]
										,[
											9,
											[
												23,
												"dy"
											]
											,[
												0,
												2
											]
										]
									]
									]
								]
								]
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetHeight,
						null,
						155
						,[
						[
							0,
							[
								23,
								"strength"
							]
						]
						]
					]
					]
					,[
					[
						0,
						null,
						false,
						174,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							172
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								4
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						]
						,[
						[
							0,
							null,
							false,
							165,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								166
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									2
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								156
								,[
								[
									0,
									[
										5,
										[
											0,
											90
										]
										,[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													3,
													[
														23,
														"dx"
													]
												]
											]
											]
										]
									]
								]
								]
							]
							]
						]
,						[
							0,
							null,
							false,
							167,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								170
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									4
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								169
								,[
								[
									0,
									[
										5,
										[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													23,
													"dx"
												]
											]
											]
										]
										,[
											0,
											90
										]
									]
								]
								]
							]
							]
						]
						]
					]
,					[
						0,
						null,
						false,
						194,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							195
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								2
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						]
						,[
						[
							0,
							null,
							false,
							196,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								197
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									2
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								198
								,[
								[
									0,
									[
										5,
										[
											0,
											270
										]
										,[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													3,
													[
														23,
														"dx"
													]
												]
											]
											]
										]
									]
								]
								]
							]
							]
						]
,						[
							0,
							null,
							false,
							199,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								200
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									4
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								4,
								cr.plugins_.Sprite.prototype.acts.SetAngle,
								null,
								201
								,[
								[
									0,
									[
										5,
										[
											19,
											cr.system_object.prototype.exps.atan
											,[
[
												7,
												[
													23,
													"dy"
												]
												,[
													23,
													"dx"
												]
											]
											]
										]
										,[
											0,
											270
										]
									]
								]
								]
							]
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					823,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						5355105735921481
						,[
						[
							11,
							"touchGame"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						45,
						cr.plugins_.Mouse.prototype.cnds.IsButtonDown,
						null,
						0,
						false,
						true,
						false,
						1458772681566483
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						825
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						826
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						4,
						cr.plugins_.Sprite.prototype.cnds.CompareHeight,
						null,
						0,
						false,
						false,
						false,
						827
						,[
						[
							8,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						828
						,[
						[
							11,
							"aimStarted"
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					126,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						6975480067957071
						,[
						[
							11,
							"touchGame"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						45,
						cr.plugins_.Mouse.prototype.cnds.IsButtonDown,
						null,
						0,
						false,
						true,
						false,
						9688752253487042
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						129
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						358
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false,
						130
					]
					],
					[
					[
						4,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						157
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						143
						,[
						[
							11,
							"vz"
						]
,						[
							7,
							[
								6,
								[
									23,
									"strength"
								]
								,[
									0,
									20
								]
							]
						]
						]
					]
					]
					,[
					[
						0,
						null,
						false,
						186,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							187
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								5
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							144
							,[
							[
								11,
								"vx"
							]
,							[
								7,
								[
									6,
									[
										3,
										[
											23,
											"dx"
										]
									]
									,[
										0,
										8
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							145
							,[
							[
								11,
								"vy"
							]
,							[
								7,
								[
									6,
									[
										19,
										cr.system_object.prototype.exps.abs
										,[
[
											5,
											[
												5,
												[
													20,
													0,
													cr.plugins_.Sprite.prototype.exps.Y,
													false,
													null
												]
												,[
													20,
													0,
													cr.plugins_.Sprite.prototype.exps.Height,
													false,
													null
												]
											]
											,[
												23,
												"touchOriginY"
											]
										]
										]
									]
									,[
										7,
										[
											23,
											"strength"
										]
										,[
											0,
											5
										]
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							346
							,[
							[
								11,
								"gkvy"
							]
,							[
								7,
								[
									19,
									cr.system_object.prototype.exps.min
									,[
[
										23,
										"vy"
									]
,[
										6,
										[
											23,
											"goalKeeperMaxSpeed"
										]
										,[
											0,
											3
										]
									]
									]
								]
							]
							]
						]
,						[
							37,
							cr.plugins_.Audio.prototype.acts.Play,
							null,
							957
							,[
							[
								2,
								["ballkick",false]
							]
,							[
								3,
								0
							]
,							[
								0,
								[
									0,
									0
								]
							]
,							[
								1,
								[
									2,
									"ballkick"
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							16
							,[
							[
								11,
								"moving"
							]
,							[
								7,
								[
									0,
									1
								]
							]
							]
						]
,						[
							6,
							cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
							null,
							1159
							,[
							[
								0,
								[
									0,
									1
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							1024
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						]
						,[
						[
							0,
							null,
							false,
							1019,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								1020
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									1
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								325
								,[
								[
									11,
									"gkvx"
								]
,								[
									7,
									[
										6,
										[
											7,
											[
												23,
												"vx"
											]
											,[
												19,
												cr.system_object.prototype.exps.abs
												,[
[
													23,
													"vx"
												]
												]
											]
										]
										,[
											19,
											cr.system_object.prototype.exps.min
											,[
[
												6,
												[
													19,
													cr.system_object.prototype.exps.abs
													,[
[
														23,
														"vx"
													]
													]
												]
												,[
													1,
													0.75
												]
											]
,[
												23,
												"goalKeeperMaxSpeed"
											]
											]
										]
									]
								]
								]
							]
							]
						]
						]
					]
,					[
						0,
						null,
						false,
						178,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							179
							,[
							[
								11,
								"dy"
							]
,							[
								8,
								2
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							204
							,[
							[
								11,
								"vx"
							]
,							[
								7,
								[
									6,
									[
										23,
										"dx"
									]
									,[
										0,
										8
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							205
							,[
							[
								11,
								"vy"
							]
,							[
								7,
								[
									6,
									[
										19,
										cr.system_object.prototype.exps.abs
										,[
[
											5,
											[
												5,
												[
													20,
													0,
													cr.plugins_.Sprite.prototype.exps.Y,
													false,
													null
												]
												,[
													7,
													[
														20,
														0,
														cr.plugins_.Sprite.prototype.exps.Height,
														false,
														null
													]
													,[
														0,
														2
													]
												]
											]
											,[
												23,
												"touchOriginY"
											]
										]
										]
									]
									,[
										7,
										[
											23,
											"strength"
										]
										,[
											0,
											5
										]
									]
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							344
							,[
							[
								11,
								"gkvy"
							]
,							[
								7,
								[
									19,
									cr.system_object.prototype.exps.min
									,[
[
										23,
										"vy"
									]
,[
										6,
										[
											23,
											"goalKeeperMaxSpeed"
										]
										,[
											0,
											3
										]
									]
									]
								]
							]
							]
						]
,						[
							37,
							cr.plugins_.Audio.prototype.acts.Play,
							null,
							958
							,[
							[
								2,
								["ballkick",false]
							]
,							[
								3,
								0
							]
,							[
								0,
								[
									0,
									0
								]
							]
,							[
								1,
								[
									2,
									"ballkick"
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							206
							,[
							[
								11,
								"moving"
							]
,							[
								7,
								[
									0,
									1
								]
							]
							]
						]
,						[
							6,
							cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
							null,
							1158
							,[
							[
								0,
								[
									0,
									1
								]
							]
							]
						]
,						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							1025
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						]
						,[
						[
							0,
							null,
							false,
							1021,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								1022
								,[
								[
									11,
									"dx"
								]
,								[
									8,
									1
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								317
								,[
								[
									11,
									"gkvx"
								]
,								[
									7,
									[
										6,
										[
											7,
											[
												23,
												"vx"
											]
											,[
												19,
												cr.system_object.prototype.exps.abs
												,[
[
													23,
													"vx"
												]
												]
											]
										]
										,[
											19,
											cr.system_object.prototype.exps.min
											,[
[
												6,
												[
													19,
													cr.system_object.prototype.exps.abs
													,[
[
														23,
														"vx"
													]
													]
												]
												,[
													1,
													0.75
												]
											]
,[
												23,
												"goalKeeperMaxSpeed"
											]
											]
										]
									]
								]
								]
							]
							]
						]
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Ball flying"],
			false,
			288,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				288
				,[
				[
					1,
					[
						2,
						"Ball flying"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				17,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false,
					18
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					282
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					29
					,[
					[
						11,
						"vy"
					]
,					[
						7,
						[
							6,
							[
								23,
								"ay"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					28
					,[
					[
						11,
						"vz"
					]
,					[
						7,
						[
							19,
							cr.system_object.prototype.exps.max
							,[
[
								0,
								0
							]
,[
								4,
								[
									23,
									"vz"
								]
								,[
									6,
									[
										23,
										"az"
									]
									,[
										19,
										cr.system_object.prototype.exps.dt
									]
								]
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					30
					,[
					[
						11,
						"z"
					]
,					[
						7,
						[
							6,
							[
								23,
								"vz"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					31
					,[
					[
						11,
						"y"
					]
,					[
						7,
						[
							6,
							[
								23,
								"vy"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					78
					,[
					[
						11,
						"x"
					]
,					[
						7,
						[
							6,
							[
								23,
								"vx"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					87
					,[
					[
						11,
						"px"
					]
,					[
						7,
						[
							6,
							[
								23,
								"x"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					88
					,[
					[
						11,
						"py"
					]
,					[
						7,
						[
							6,
							[
								23,
								"y"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null,
					323
					,[
					[
						0,
						[
							4,
							[
								7,
								[
									19,
									cr.system_object.prototype.exps.layoutwidth
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"px"
							]
						]
					]
,					[
						0,
						[
							5,
							[
								3,
								[
									23,
									"py"
								]
							]
							,[
								23,
								"yOffset"
							]
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetSize,
					null,
					98
					,[
					[
						0,
						[
							6,
							[
								23,
								"ballSize"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
,					[
						0,
						[
							6,
							[
								23,
								"ballSize"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					339
					,[
					[
						11,
						"gkvy"
					]
,					[
						7,
						[
							6,
							[
								23,
								"ay"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					315
					,[
					[
						11,
						"gkx"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gkvx"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					340
					,[
					[
						11,
						"gky"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gkvy"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					321
					,[
					[
						11,
						"pgkx"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gkx"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					322
					,[
					[
						11,
						"pgky"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gky"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
					]
					]
				]
,				[
					6,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null,
					316
					,[
					[
						0,
						[
							4,
							[
								7,
								[
									19,
									cr.system_object.prototype.exps.layoutwidth
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"pgkx"
							]
						]
					]
,					[
						0,
						[
							5,
							[
								3,
								[
									23,
									"pgky"
								]
							]
							,[
								23,
								"yOffset"
							]
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					495,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						496
						,[
						[
							11,
							"gkvx"
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						6,
						cr.plugins_.Sprite.prototype.acts.RotateTowardAngle,
						null,
						497
						,[
						[
							0,
							[
								6,
								[
									23,
									"gkvx"
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
						]
,						[
							0,
							[
								0,
								90
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					498,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						499
						,[
						[
							11,
							"gkvx"
						]
,						[
							8,
							2
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						6,
						cr.plugins_.Sprite.prototype.acts.RotateTowardAngle,
						null,
						500
						,[
						[
							0,
							[
								6,
								[
									3,
									[
										23,
										"gkvx"
									]
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
						]
,						[
							0,
							[
								0,
								-90
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					501,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						502
						,[
						[
							11,
							"vx"
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						0,
						cr.plugins_.Sprite.prototype.acts.RotateClockwise,
						null,
						503
						,[
						[
							0,
							[
								6,
								[
									0,
									360
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					504,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						505
						,[
						[
							11,
							"vx"
						]
,						[
							8,
							2
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						0,
						cr.plugins_.Sprite.prototype.acts.RotateCounterclockwise,
						null,
						506
						,[
						[
							0,
							[
								6,
								[
									0,
									360
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				32,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					33
					,[
					[
						11,
						"y"
					]
,					[
						8,
						3
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					19
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					35
					,[
					[
						11,
						"y"
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					34
					,[
					[
						11,
						"vy"
					]
,					[
						7,
						[
							3,
							[
								23,
								"vy"
							]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				334,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					335
					,[
					[
						11,
						"gky"
					]
,					[
						8,
						3
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					336
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					337
					,[
					[
						11,
						"gky"
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					338
					,[
					[
						11,
						"gkvy"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Goal evaluation"],
			false,
			275,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				275
				,[
				[
					1,
					[
						2,
						"Goal evaluation"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				49,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					50
					,[
					[
						11,
						"z"
					]
,					[
						8,
						5
					]
,					[
						7,
						[
							23,
							"goalDist"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					259
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					51
					,[
					[
						11,
						"moving"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					55
					,[
					[
						11,
						"z"
					]
,					[
						7,
						[
							23,
							"goalDist"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1082
					,[
					[
						11,
						"roundEnded"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					289,
					[
					[
						0,
						cr.plugins_.Sprite.prototype.cnds.OnCollision,
						null,
						0,
						false,
						false,
						true,
						294
						,[
						[
							4,
							6
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						299
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						759
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtSaved"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						628
						,[
						[
							1,
							[
								2,
								"missed"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						293
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						696
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						697
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						698
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						699
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						700
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null,
						916
						,[
						[
							11,
							"Points"
						]
,						[
							7,
							[
								23,
								"ptOnTarget"
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					295,
					[
					[
						0,
						cr.plugins_.Sprite.prototype.cnds.OnCollision,
						null,
						0,
						false,
						false,
						true,
						296
						,[
						[
							4,
							5
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						300
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						760
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtCrossbar"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						629
						,[
						[
							1,
							[
								2,
								"missed"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						298
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						706
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						707
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						708
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						709
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						710
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null,
						917
						,[
						[
							11,
							"Points"
						]
,						[
							7,
							[
								23,
								"ptCrossbar"
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					301,
					[
					[
						0,
						cr.plugins_.Sprite.prototype.cnds.OnCollision,
						null,
						0,
						false,
						false,
						true,
						306
						,[
						[
							4,
							1
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						307
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						761
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtGoal"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						627
						,[
						[
							1,
							[
								2,
								"goal"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						305
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						1,
						cr.plugins_.Sprite.prototype.acts.StartAnim,
						null,
						545
						,[
						[
							3,
							1
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						546
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						1,
						cr.plugins_.Sprite.prototype.acts.StopAnim,
						null,
						547
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						711
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						712
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						713
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						714
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null,
						918
						,[
						[
							11,
							"Points"
						]
,						[
							7,
							[
								23,
								"ptGoal"
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					257,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						258
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						762
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtMissed"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						630
						,[
						[
							1,
							[
								2,
								"missed"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						261
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						715
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						716
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						717
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						718
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						719
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Functions"],
			false,
			622,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				622
				,[
				[
					1,
					[
						2,
						"Functions"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				742,
				[
				[
					19,
					cr.plugins_.Function.prototype.cnds.OnFunction,
					null,
					2,
					false,
					false,
					false,
					743
					,[
					[
						1,
						[
							2,
							"growText"
						]
					]
					]
				]
				],
				[
				[
					20,
					cr.plugins_.Text.prototype.acts.SetVisible,
					null,
					744
					,[
					[
						3,
						1
					]
					]
				]
,				[
					20,
					cr.plugins_.Text.prototype.acts.SetText,
					null,
					753
					,[
					[
						7,
						[
							20,
							19,
							cr.plugins_.Function.prototype.exps.Param,
							false,
							null
							,[
[
								0,
								0
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					752
					,[
					[
						11,
						"gTextStart"
					]
,					[
						7,
						[
							19,
							cr.system_object.prototype.exps.time
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					748
					,[
					[
						11,
						"gTextOn"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.Wait,
					null,
					746
					,[
					[
						0,
						[
							0,
							3
						]
					]
					]
				]
,				[
					20,
					cr.plugins_.Text.prototype.acts.SetVisible,
					null,
					745
					,[
					[
						3,
						0
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					749
					,[
					[
						11,
						"gTextOn"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				623,
				[
				[
					19,
					cr.plugins_.Function.prototype.cnds.OnFunction,
					null,
					2,
					false,
					false,
					false,
					624
					,[
					[
						1,
						[
							2,
							"goal"
						]
					]
					]
				]
				],
				[
				[
					37,
					cr.plugins_.Audio.prototype.acts.Play,
					null,
					959
					,[
					[
						2,
						["goalsfx",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							10
						]
					]
,					[
						1,
						[
							2,
							"goal"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					646
					,[
					[
						11,
						"pscore"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					631,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						632
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					],
					[
					[
						9,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						633
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					634,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						635
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								2
							]
						]
						]
					]
					],
					[
					[
						10,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						636
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					637,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						638
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								3
							]
						]
						]
					]
					],
					[
					[
						11,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						639
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					640,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						641
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								4
							]
						]
						]
					]
					],
					[
					[
						12,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						642
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					643,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						644
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								5
							]
						]
						]
					]
					],
					[
					[
						13,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						645
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				625,
				[
				[
					19,
					cr.plugins_.Function.prototype.cnds.OnFunction,
					null,
					2,
					false,
					false,
					false,
					626
					,[
					[
						1,
						[
							2,
							"missed"
						]
					]
					]
				]
				],
				[
				[
					37,
					cr.plugins_.Audio.prototype.acts.Play,
					null,
					965
					,[
					[
						2,
						["missed",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							0
						]
					]
,					[
						1,
						[
							2,
							"missed"
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					653,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						654
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					],
					[
					[
						9,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						655
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					656,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						657
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								2
							]
						]
						]
					]
					],
					[
					[
						10,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						658
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					659,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						660
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								3
							]
						]
						]
					]
					],
					[
					[
						11,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						661
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					662,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						663
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								4
							]
						]
						]
					]
					],
					[
					[
						12,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						664
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					665,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						666
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								5
							]
						]
						]
					]
					],
					[
					[
						13,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						667
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				754,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					755
					,[
					[
						11,
						"gTextOn"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					20,
					cr.plugins_.Text.prototype.acts.SetFontSize,
					null,
					757
					,[
					[
						0,
						[
							4,
							[
								19,
								cr.system_object.prototype.exps.round
								,[
[
									19,
									cr.system_object.prototype.exps.lerp
									,[
[
										0,
										1
									]
,[
										0,
										200
									]
,[
										7,
										[
											5,
											[
												19,
												cr.system_object.prototype.exps.time
											]
											,[
												23,
												"gTextStart"
											]
										]
										,[
											23,
											"gTextTime"
										]
									]
									]
								]
								]
							]
							,[
								0,
								1
							]
						]
					]
					]
				]
,				[
					20,
					cr.plugins_.Text.prototype.acts.SetOpacity,
					null,
					758
					,[
					[
						0,
						[
							19,
							cr.system_object.prototype.exps.lerp
							,[
[
								0,
								100
							]
,[
								0,
								0
							]
,[
								7,
								[
									5,
									[
										19,
										cr.system_object.prototype.exps.time
									]
									,[
										23,
										"gTextStart"
									]
								]
								,[
									23,
									"gTextTime"
								]
							]
							]
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Control"],
			false,
			113,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				113
				,[
				[
					1,
					[
						2,
						"Control"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				true,
				1120,
				[
				[
					2,
					cr.plugins_.Touch.prototype.cnds.OnTouchObject,
					null,
					1,
					false,
					false,
					false,
					1121
					,[
					[
						4,
						42
					]
					]
				]
,				[
					45,
					cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
					null,
					1,
					false,
					false,
					false,
					5014856972575753
					,[
					[
						3,
						0
					]
,					[
						3,
						0
					]
,					[
						4,
						42
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					1122,
					[
					[
						42,
						cr.plugins_.Sprite.prototype.cnds.CompareFrame,
						null,
						0,
						false,
						false,
						false,
						1123
						,[
						[
							8,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.SetMasterVolume,
						null,
						1148
						,[
						[
							0,
							[
								0,
								-10000
							]
						]
						]
					]
,					[
						42,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						1125
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						1126
						,[
						[
							11,
							"noSounds"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					1127,
					[
					[
						-1,
						cr.system_object.prototype.cnds.Else,
						null,
						0,
						false,
						false,
						false,
						1128
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.SetMasterVolume,
						null,
						1149
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						42,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						1130
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						1131
						,[
						[
							11,
							"noSounds"
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				70,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					1083
					,[
					[
						11,
						"roundEnded"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1092
					,[
					[
						11,
						"roundEnded"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					1011,
					[
					[
						-1,
						cr.system_object.prototype.cnds.Compare,
						null,
						0,
						false,
						false,
						false,
						1012
						,[
						[
							7,
							[
								23,
								"pscore"
							]
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								23,
								"oscore"
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.Compare,
						null,
						0,
						false,
						false,
						false,
						1013
						,[
						[
							7,
							[
								5,
								[
									23,
									"pscore"
								]
								,[
									23,
									"oscore"
								]
							]
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								4,
								[
									5,
									[
										0,
										5
									]
									,[
										23,
										"myround"
									]
								]
								,[
									0,
									1
								]
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						1084
						,[
						[
							0,
							[
								0,
								5
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.GoToLayout,
						null,
						1014
						,[
						[
							6,
							"Results"
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					999,
					[
					[
						-1,
						cr.system_object.prototype.cnds.Compare,
						null,
						0,
						false,
						false,
						false,
						1003
						,[
						[
							7,
							[
								23,
								"oscore"
							]
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								23,
								"pscore"
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.Compare,
						null,
						0,
						false,
						false,
						false,
						1015
						,[
						[
							7,
							[
								5,
								[
									23,
									"oscore"
								]
								,[
									23,
									"pscore"
								]
							]
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								5,
								[
									0,
									5
								]
								,[
									23,
									"myround"
								]
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						1085
						,[
						[
							0,
							[
								0,
								5
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.GoToLayout,
						null,
						1004
						,[
						[
							6,
							"Results"
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					1009,
					[
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						1086
						,[
						[
							0,
							[
								0,
								5
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.GoToLayout,
						null,
						73
						,[
						[
							6,
							"Defend"
						]
						]
					]
					]
				]
				]
			]
			]
		]
		]
	]
,	[
		"Defend events",
		[
		[
			1,
			"selectedKick",
			0,
			0,
false,false,804
		]
,		[
			1,
			"numOfKicks",
			0,
			0,
false,false,802
		]
,		[
			1,
			"dist",
			0,
			0,
false,false,535
		]
,		[
			1,
			"glovesRealY",
			0,
			0,
false,false,513
		]
,		[
			1,
			"fi",
			0,
			0,
false,false,550
		]
,		[
			1,
			"glovesSet",
			0,
			0,
false,false,834
		]
,		[
			1,
			"timerON",
			0,
			0,
false,false,8032601979744021
		]
,		[
			1,
			"glovesRealX",
			0,
			0,
false,false,512
		]
,		[
			0,
			null,
			false,
			458,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false,
				459
			]
			],
			[
			[
				37,
				cr.plugins_.Audio.prototype.acts.Stop,
				null,
				968
				,[
				[
					1,
					[
						2,
						"goal"
					]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Stop,
				null,
				969
				,[
				[
					1,
					[
						2,
						"missed"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				722
				,[
				[
					11,
					"aimStarted"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				723
				,[
				[
					11,
					"moving"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				731
				,[
				[
					11,
					"gotResult"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				727
				,[
				[
					11,
					"x"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				460
				,[
				[
					11,
					"y"
				]
,				[
					7,
					[
						3,
						[
							23,
							"cameraHeight"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				461
				,[
				[
					11,
					"z"
				]
,				[
					7,
					[
						4,
						[
							23,
							"dispz"
						]
						,[
							23,
							"db"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				462
				,[
				[
					11,
					"goalDist"
				]
,				[
					7,
					[
						4,
						[
							4,
							[
								23,
								"dispz"
							]
							,[
								23,
								"db"
							]
						]
						,[
							0,
							1350
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				463
				,[
				[
					0,
					[
						6,
						[
							23,
							"goalWidth"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"goalHeight"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetPos,
				null,
				464
				,[
				[
					0,
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.layoutwidth
						]
						,[
							0,
							2
						]
					]
				]
,				[
					0,
					[
						5,
						[
							6,
							[
								23,
								"cameraHeight"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
						,[
							23,
							"yOffset"
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.StopAnim,
				null,
				548
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				549
				,[
				[
					0,
					[
						0,
						0
					]
				]
				]
			]
,			[
				5,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				465
				,[
				[
					0,
					[
						6,
						[
							4,
							[
								6,
								[
									23,
									"goalBarWidth"
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"goalWidth"
							]
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							4,
							[
								23,
								"goalBarHeight"
							]
							,[
								23,
								"goalHeight"
							]
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				5,
				cr.plugins_.Sprite.prototype.acts.SetPosToObject,
				null,
				466
				,[
				[
					4,
					1
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				6,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				467
				,[
				[
					0,
					[
						6,
						[
							23,
							"goalKeeperWidth"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"goalKeeperHeight"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				6,
				cr.plugins_.Sprite.prototype.acts.SetPosToObject,
				null,
				468
				,[
				[
					4,
					1
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				6,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				540
				,[
				[
					0,
					[
						0,
						2
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				469
				,[
				[
					11,
					"px"
				]
,				[
					7,
					[
						6,
						[
							23,
							"x"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				470
				,[
				[
					11,
					"py"
				]
,				[
					7,
					[
						6,
						[
							23,
							"y"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
				]
			]
,			[
				0,
				cr.plugins_.Sprite.prototype.acts.SetY,
				null,
				471
				,[
				[
					0,
					[
						5,
						[
							3,
							[
								23,
								"py"
							]
						]
						,[
							23,
							"yOffset"
						]
					]
				]
				]
			]
,			[
				0,
				cr.plugins_.Sprite.prototype.acts.SetX,
				null,
				472
				,[
				[
					0,
					[
						4,
						[
							7,
							[
								19,
								cr.system_object.prototype.exps.layoutwidth
							]
							,[
								0,
								2
							]
						]
						,[
							23,
							"px"
						]
					]
				]
				]
			]
,			[
				0,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				473
				,[
				[
					0,
					[
						6,
						[
							23,
							"ballSize"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"ballSize"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"z"
							]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				474
				,[
				[
					11,
					"gkx"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				475
				,[
				[
					11,
					"gky"
				]
,				[
					7,
					[
						3,
						[
							23,
							"cameraHeight"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				835
				,[
				[
					11,
					"glovesSet"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1087
				,[
				[
					11,
					"roundEnded"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				41,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				1095
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/ready/text()"
						]
						]
					]
				]
				]
			]
,			[
				42,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				1145
				,[
				[
					0,
					[
						23,
						"noSounds"
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Setting gloves"],
			false,
			477,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				477
				,[
				[
					1,
					[
						2,
						"Setting gloves"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				686626511747989,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					666964516956226
					,[
					[
						11,
						"timerON"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					835232891104822
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					8424036341074079
					,[
					[
						11,
						"gotResult"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					4821122893610628
					,[
					[
						7,
						[
							20,
							23,
							cr.plugins_.Rex_Date.prototype.exps.Timer,
							false,
							null
							,[
[
								2,
								"placegloves"
							]
							]
						]
					]
,					[
						8,
						5
					]
,					[
						7,
						[
							23,
							"compKickWaitTime"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.TriggerOnce,
					null,
					0,
					false,
					false,
					false,
					7504689948894791
				]
				],
				[
				[
					8,
					cr.plugins_.Sprite.prototype.acts.SetVisible,
					null,
					7325307540795219
					,[
					[
						3,
						0
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					2659625226790214
					,[
					[
						11,
						"glovesSet"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					9489466919236418
					,[
					[
						11,
						"moving"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					6,
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
					null,
					7402844125729399
					,[
					[
						0,
						[
							0,
							3
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					4695082438744787
					,[
					[
						11,
						"timerON"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
,			[
				0,
				[true, "TOUCH"],
				false,
				8311832344995061,
				[
				[
					-1,
					cr.system_object.prototype.cnds.IsGroupActive,
					null,
					0,
					false,
					false,
					false,
					8311832344995061
					,[
					[
						1,
						[
							2,
							"TOUCH"
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					114,
					[
					[
						2,
						cr.plugins_.Touch.prototype.cnds.OnTouchObject,
						null,
						1,
						false,
						false,
						false,
						115
						,[
						[
							4,
							8
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						116
						,[
						[
							11,
							"moving"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						357
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						8,
						cr.plugins_.Sprite.prototype.cnds.IsVisible,
						null,
						0,
						false,
						false,
						false,
						831
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						836
						,[
						[
							11,
							"glovesSet"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						125
						,[
						[
							11,
							"aimStarted"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					134,
					[
					[
						2,
						cr.plugins_.Touch.prototype.cnds.IsInTouch,
						null,
						0,
						false,
						false,
						false,
						135
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						140
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						563
						,[
						[
							11,
							"moving"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						8,
						cr.plugins_.Sprite.prototype.acts.SetX,
						null,
						481
						,[
						[
							0,
							[
								20,
								2,
								cr.plugins_.Touch.prototype.exps.X,
								false,
								null
							]
						]
						]
					]
,					[
						8,
						cr.plugins_.Sprite.prototype.acts.SetY,
						null,
						482
						,[
						[
							0,
							[
								20,
								2,
								cr.plugins_.Touch.prototype.exps.Y,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						514
						,[
						[
							11,
							"glovesRealX"
						]
,						[
							7,
							[
								6,
								[
									5,
									[
										20,
										8,
										cr.plugins_.Sprite.prototype.exps.X,
										false,
										null
									]
									,[
										7,
										[
											19,
											cr.system_object.prototype.exps.layoutwidth
										]
										,[
											0,
											2
										]
									]
								]
								,[
									7,
									[
										23,
										"goalDist"
									]
									,[
										23,
										"dispz"
									]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						515
						,[
						[
							11,
							"glovesRealY"
						]
,						[
							7,
							[
								6,
								[
									5,
									[
										3,
										[
											20,
											8,
											cr.plugins_.Sprite.prototype.exps.Y,
											false,
											null
										]
									]
									,[
										23,
										"yOffset"
									]
								]
								,[
									7,
									[
										23,
										"goalDist"
									]
									,[
										23,
										"dispz"
									]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						510
						,[
						[
							11,
							"dx"
						]
,						[
							7,
							[
								5,
								[
									23,
									"glovesRealX"
								]
								,[
									23,
									"gkx"
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						511
						,[
						[
							11,
							"dy"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.max
								,[
[
									0,
									0
								]
,[
									5,
									[
										23,
										"glovesRealY"
									]
									,[
										23,
										"gky"
									]
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						536
						,[
						[
							11,
							"dist"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.sqrt
								,[
[
									4,
									[
										9,
										[
											23,
											"dx"
										]
										,[
											0,
											2
										]
									]
									,[
										9,
										[
											23,
											"dy"
										]
										,[
											0,
											2
										]
									]
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						551
						,[
						[
							11,
							"fi"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.atan
								,[
[
									7,
									[
										23,
										"dx"
									]
									,[
										23,
										"dy"
									]
								]
								]
							]
						]
						]
					]
					]
					,[
					[
						0,
						null,
						false,
						522,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							523
							,[
							[
								11,
								"dist"
							]
,							[
								8,
								5
							]
,							[
								7,
								[
									23,
									"goalKeeperHeight"
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							529
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									6,
									[
										23,
										"goalKeeperMaxSpeed"
									]
									,[
										7,
										[
											23,
											"dx"
										]
										,[
											23,
											"dist"
										]
									]
								]
							]
							]
						]
						]
						,[
						[
							0,
							null,
							false,
							553,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								554
								,[
								[
									11,
									"dy"
								]
,								[
									8,
									2
								]
,								[
									7,
									[
										23,
										"goalKeeperHeight"
									]
								]
								]
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								557
								,[
								[
									11,
									"gkvy"
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							]
						]
,						[
							0,
							null,
							false,
							555,
							[
							[
								-1,
								cr.system_object.prototype.cnds.Else,
								null,
								0,
								false,
								false,
								false,
								556
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								534
								,[
								[
									11,
									"gkvy"
								]
,								[
									7,
									[
										6,
										[
											23,
											"goalKeeperMaxSpeed"
										]
										,[
											0,
											3
										]
									]
								]
								]
							]
							]
						]
						]
					]
,					[
						0,
						null,
						false,
						559,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							560
							,[
							[
								11,
								"dist"
							]
,							[
								8,
								2
							]
,							[
								7,
								[
									23,
									"goalKeeperHeight"
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							561
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					126,
					[
					[
						2,
						cr.plugins_.Touch.prototype.cnds.IsInTouch,
						null,
						0,
						false,
						true,
						false,
						128
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						889173106235336
						,[
						[
							11,
							"touchGame"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						129
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						358
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false,
						130
					]
					],
					[
					[
						8,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						483
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						837
						,[
						[
							11,
							"glovesSet"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						838
						,[
						[
							11,
							"moving"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						1160
						,[
						[
							0,
							[
								0,
								3
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						5253177669731779
						,[
						[
							11,
							"timerON"
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				[true, "MOUSE"],
				false,
				595491073869847,
				[
				[
					-1,
					cr.system_object.prototype.cnds.IsGroupActive,
					null,
					0,
					false,
					false,
					false,
					595491073869847
					,[
					[
						1,
						[
							2,
							"MOUSE"
						]
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					7949135096650029,
					[
					[
						45,
						cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
						null,
						1,
						false,
						false,
						false,
						7918796684796297
						,[
						[
							3,
							0
						]
,						[
							3,
							0
						]
,						[
							4,
							8
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						8770703807446826
						,[
						[
							11,
							"moving"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						3913412650450541
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						8,
						cr.plugins_.Sprite.prototype.cnds.IsVisible,
						null,
						0,
						false,
						false,
						false,
						3551473263879009
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						796760778222648
						,[
						[
							11,
							"glovesSet"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						2052199175377576
						,[
						[
							11,
							"aimStarted"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					2864765018202219,
					[
					[
						45,
						cr.plugins_.Mouse.prototype.cnds.IsButtonDown,
						null,
						0,
						false,
						false,
						false,
						5550183217790415
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						1356273617557512
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						4564490550486603
						,[
						[
							11,
							"moving"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						8,
						cr.plugins_.Sprite.prototype.acts.SetX,
						null,
						7288880401304488
						,[
						[
							0,
							[
								20,
								45,
								cr.plugins_.Mouse.prototype.exps.X,
								false,
								null
							]
						]
						]
					]
,					[
						8,
						cr.plugins_.Sprite.prototype.acts.SetY,
						null,
						8077746219732715
						,[
						[
							0,
							[
								20,
								45,
								cr.plugins_.Mouse.prototype.exps.Y,
								false,
								null
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						5708275252068847
						,[
						[
							11,
							"glovesRealX"
						]
,						[
							7,
							[
								6,
								[
									5,
									[
										20,
										8,
										cr.plugins_.Sprite.prototype.exps.X,
										false,
										null
									]
									,[
										7,
										[
											19,
											cr.system_object.prototype.exps.layoutwidth
										]
										,[
											0,
											2
										]
									]
								]
								,[
									7,
									[
										23,
										"goalDist"
									]
									,[
										23,
										"dispz"
									]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						5496960210753098
						,[
						[
							11,
							"glovesRealY"
						]
,						[
							7,
							[
								6,
								[
									5,
									[
										3,
										[
											20,
											8,
											cr.plugins_.Sprite.prototype.exps.Y,
											false,
											null
										]
									]
									,[
										23,
										"yOffset"
									]
								]
								,[
									7,
									[
										23,
										"goalDist"
									]
									,[
										23,
										"dispz"
									]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						530694051965
						,[
						[
							11,
							"dx"
						]
,						[
							7,
							[
								5,
								[
									23,
									"glovesRealX"
								]
								,[
									23,
									"gkx"
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						6157446492981206
						,[
						[
							11,
							"dy"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.max
								,[
[
									0,
									0
								]
,[
									5,
									[
										23,
										"glovesRealY"
									]
									,[
										23,
										"gky"
									]
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						9031487229386291
						,[
						[
							11,
							"dist"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.sqrt
								,[
[
									4,
									[
										9,
										[
											23,
											"dx"
										]
										,[
											0,
											2
										]
									]
									,[
										9,
										[
											23,
											"dy"
										]
										,[
											0,
											2
										]
									]
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						5184074779187242
						,[
						[
							11,
							"fi"
						]
,						[
							7,
							[
								19,
								cr.system_object.prototype.exps.atan
								,[
[
									7,
									[
										23,
										"dx"
									]
									,[
										23,
										"dy"
									]
								]
								]
							]
						]
						]
					]
					]
					,[
					[
						0,
						null,
						false,
						8815171239670903,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							4383569109325232
							,[
							[
								11,
								"dist"
							]
,							[
								8,
								5
							]
,							[
								7,
								[
									23,
									"goalKeeperHeight"
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							2354146790596983
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									6,
									[
										23,
										"goalKeeperMaxSpeed"
									]
									,[
										7,
										[
											23,
											"dx"
										]
										,[
											23,
											"dist"
										]
									]
								]
							]
							]
						]
						]
						,[
						[
							0,
							null,
							false,
							9670823972854031,
							[
							[
								-1,
								cr.system_object.prototype.cnds.CompareVar,
								null,
								0,
								false,
								false,
								false,
								8970922443671941
								,[
								[
									11,
									"dy"
								]
,								[
									8,
									2
								]
,								[
									7,
									[
										23,
										"goalKeeperHeight"
									]
								]
								]
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								7352287510558475
								,[
								[
									11,
									"gkvy"
								]
,								[
									7,
									[
										0,
										0
									]
								]
								]
							]
							]
						]
,						[
							0,
							null,
							false,
							8014592997640227,
							[
							[
								-1,
								cr.system_object.prototype.cnds.Else,
								null,
								0,
								false,
								false,
								false,
								1239062482895974
							]
							],
							[
							[
								-1,
								cr.system_object.prototype.acts.SetVar,
								null,
								1993960111593082
								,[
								[
									11,
									"gkvy"
								]
,								[
									7,
									[
										6,
										[
											23,
											"goalKeeperMaxSpeed"
										]
										,[
											0,
											3
										]
									]
								]
								]
							]
							]
						]
						]
					]
,					[
						0,
						null,
						false,
						4886159387783152,
						[
						[
							-1,
							cr.system_object.prototype.cnds.CompareVar,
							null,
							0,
							false,
							false,
							false,
							8009745924077919
							,[
							[
								11,
								"dist"
							]
,							[
								8,
								2
							]
,							[
								7,
								[
									23,
									"goalKeeperHeight"
								]
							]
							]
						]
						],
						[
						[
							-1,
							cr.system_object.prototype.acts.SetVar,
							null,
							2963046633463786
							,[
							[
								11,
								"gkvx"
							]
,							[
								7,
								[
									0,
									0
								]
							]
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					1312325476911444,
					[
					[
						45,
						cr.plugins_.Mouse.prototype.cnds.IsButtonDown,
						null,
						0,
						false,
						true,
						false,
						7560461416419536
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						5121883996194182
						,[
						[
							11,
							"touchGame"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						9033989673555726
						,[
						[
							11,
							"aimStarted"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						4804440239257956
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.TriggerOnce,
						null,
						0,
						false,
						false,
						false,
						5596571496760487
					]
					],
					[
					[
						8,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						6978662632689402
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						8553650459696318
						,[
						[
							11,
							"glovesSet"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						753778488104965
						,[
						[
							11,
							"moving"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						6044926891588631
						,[
						[
							0,
							[
								0,
								3
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						9139007467605879
						,[
						[
							11,
							"timerON"
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Ball flying"],
			false,
			478,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				478
				,[
				[
					1,
					[
						2,
						"Ball flying"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				17,
				[
				[
					-1,
					cr.system_object.prototype.cnds.EveryTick,
					null,
					0,
					false,
					false,
					false,
					18
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					282
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					29
					,[
					[
						11,
						"vy"
					]
,					[
						7,
						[
							6,
							[
								23,
								"ay"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					28
					,[
					[
						11,
						"vz"
					]
,					[
						7,
						[
							19,
							cr.system_object.prototype.exps.max
							,[
[
								0,
								0
							]
,[
								4,
								[
									23,
									"vz"
								]
								,[
									6,
									[
										23,
										"az"
									]
									,[
										19,
										cr.system_object.prototype.exps.dt
									]
								]
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					30
					,[
					[
						11,
						"z"
					]
,					[
						7,
						[
							6,
							[
								23,
								"vz"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					31
					,[
					[
						11,
						"y"
					]
,					[
						7,
						[
							6,
							[
								23,
								"vy"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					78
					,[
					[
						11,
						"x"
					]
,					[
						7,
						[
							6,
							[
								23,
								"vx"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					87
					,[
					[
						11,
						"px"
					]
,					[
						7,
						[
							6,
							[
								23,
								"x"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					88
					,[
					[
						11,
						"py"
					]
,					[
						7,
						[
							6,
							[
								23,
								"y"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null,
					323
					,[
					[
						0,
						[
							4,
							[
								7,
								[
									19,
									cr.system_object.prototype.exps.layoutwidth
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"px"
							]
						]
					]
,					[
						0,
						[
							5,
							[
								3,
								[
									23,
									"py"
								]
							]
							,[
								23,
								"yOffset"
							]
						]
					]
					]
				]
,				[
					0,
					cr.plugins_.Sprite.prototype.acts.SetSize,
					null,
					98
					,[
					[
						0,
						[
							6,
							[
								23,
								"ballSize"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
,					[
						0,
						[
							6,
							[
								23,
								"ballSize"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"z"
								]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					339
					,[
					[
						11,
						"gkvy"
					]
,					[
						7,
						[
							6,
							[
								23,
								"ay"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					315
					,[
					[
						11,
						"gkx"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gkvx"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					340
					,[
					[
						11,
						"gky"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gkvy"
							]
							,[
								19,
								cr.system_object.prototype.exps.dt
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					321
					,[
					[
						11,
						"pgkx"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gkx"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					322
					,[
					[
						11,
						"pgky"
					]
,					[
						7,
						[
							6,
							[
								23,
								"gky"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
					]
					]
				]
,				[
					6,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null,
					316
					,[
					[
						0,
						[
							4,
							[
								7,
								[
									19,
									cr.system_object.prototype.exps.layoutwidth
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"pgkx"
							]
						]
					]
,					[
						0,
						[
							5,
							[
								3,
								[
									23,
									"pgky"
								]
							]
							,[
								23,
								"yOffset"
							]
						]
					]
					]
				]
,				[
					6,
					cr.plugins_.Sprite.prototype.acts.RotateTowardAngle,
					null,
					326
					,[
					[
						0,
						[
							6,
							[
								6,
								[
									19,
									cr.system_object.prototype.exps.abs
									,[
[
										23,
										"fi"
									]
									]
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
							,[
								0,
								2
							]
						]
					]
,					[
						0,
						[
							23,
							"fi"
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					487,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						488
						,[
						[
							11,
							"vx"
						]
,						[
							8,
							4
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						0,
						cr.plugins_.Sprite.prototype.acts.RotateClockwise,
						null,
						490
						,[
						[
							0,
							[
								6,
								[
									0,
									360
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					491,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						492
						,[
						[
							11,
							"vx"
						]
,						[
							8,
							2
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						0,
						cr.plugins_.Sprite.prototype.acts.RotateCounterclockwise,
						null,
						494
						,[
						[
							0,
							[
								6,
								[
									0,
									360
								]
								,[
									19,
									cr.system_object.prototype.exps.dt
								]
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				839,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					840
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					841
					,[
					[
						11,
						"glovesSet"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					842
					,[
					[
						11,
						"z"
					]
,					[
						8,
						5
					]
,					[
						7,
						[
							7,
							[
								23,
								"goalDist"
							]
							,[
								0,
								10
							]
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					844
					,[
					[
						11,
						"moving"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					8,
					cr.plugins_.Sprite.prototype.acts.SetVisible,
					null,
					843
					,[
					[
						3,
						1
					]
					]
				]
,				[
					23,
					cr.plugins_.Rex_Date.prototype.acts.StartTimer,
					null,
					3231538240069759
					,[
					[
						7,
						[
							2,
							"placegloves"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					3782379667348655
					,[
					[
						11,
						"timerON"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					8,
					cr.plugins_.Sprite.prototype.acts.SetPos,
					null,
					1302255791978712
					,[
					[
						0,
						[
							20,
							28,
							cr.plugins_.Sprite.prototype.exps.X,
							false,
							null
						]
					]
,					[
						0,
						[
							20,
							28,
							cr.plugins_.Sprite.prototype.exps.Y,
							false,
							null
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				32,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					33
					,[
					[
						11,
						"y"
					]
,					[
						8,
						3
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					19
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					35
					,[
					[
						11,
						"y"
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					34
					,[
					[
						11,
						"vy"
					]
,					[
						7,
						[
							3,
							[
								23,
								"vy"
							]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				334,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					335
					,[
					[
						11,
						"gky"
					]
,					[
						8,
						3
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					336
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					337
					,[
					[
						11,
						"gky"
					]
,					[
						7,
						[
							3,
							[
								23,
								"cameraHeight"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					338
					,[
					[
						11,
						"gkvy"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Goal evaluation"],
			false,
			479,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				479
				,[
				[
					1,
					[
						2,
						"Goal evaluation"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				49,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					50
					,[
					[
						11,
						"z"
					]
,					[
						8,
						5
					]
,					[
						7,
						[
							23,
							"goalDist"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					259
					,[
					[
						11,
						"moving"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					51
					,[
					[
						11,
						"moving"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					55
					,[
					[
						11,
						"z"
					]
,					[
						7,
						[
							23,
							"goalDist"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1088
					,[
					[
						11,
						"roundEnded"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					289,
					[
					[
						0,
						cr.plugins_.Sprite.prototype.cnds.OnCollision,
						null,
						0,
						false,
						false,
						true,
						294
						,[
						[
							4,
							6
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						299
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						776
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtSaved"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						672
						,[
						[
							1,
							[
								2,
								"missed"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						293
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						589
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						590
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						591
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						592
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						593
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null,
						919
						,[
						[
							11,
							"Points"
						]
,						[
							7,
							[
								23,
								"ptSaved"
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					295,
					[
					[
						0,
						cr.plugins_.Sprite.prototype.cnds.OnCollision,
						null,
						0,
						false,
						false,
						true,
						296
						,[
						[
							4,
							5
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						300
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						777
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtCrossbar"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						673
						,[
						[
							1,
							[
								2,
								"missed"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						298
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						701
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						702
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						703
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						704
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						705
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					301,
					[
					[
						0,
						cr.plugins_.Sprite.prototype.cnds.OnCollision,
						null,
						0,
						false,
						false,
						true,
						306
						,[
						[
							4,
							1
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						307
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						778
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtGoal"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						675
						,[
						[
							1,
							[
								2,
								"goal"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						305
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						1,
						cr.plugins_.Sprite.prototype.acts.StartAnim,
						null,
						564
						,[
						[
							3,
							1
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						565
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						1,
						cr.plugins_.Sprite.prototype.acts.StopAnim,
						null,
						566
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						570
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						571
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						572
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						573
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					257,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						258
						,[
						[
							11,
							"gotResult"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						779
						,[
						[
							1,
							[
								2,
								"growText"
							]
						]
,						[
							13,
															[
									7,
									[
										23,
										"txtMissed"
									]
								]
						]
						]
					]
,					[
						19,
						cr.plugins_.Function.prototype.acts.CallFunction,
						null,
						674
						,[
						[
							1,
							[
								2,
								"missed"
							]
						]
,						[
							13,
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						261
						,[
						[
							11,
							"gotResult"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						1153
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						1154
						,[
						[
							4,
							1
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						1155
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
,					[
						6,
						cr.plugins_.Sprite.prototype.acts.SetAngle,
						null,
						1156
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						0,
						cr.plugins_.Sprite.prototype.acts.SetPosToObject,
						null,
						1157
						,[
						[
							4,
							6
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Functions"],
			false,
			671,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				671
				,[
				[
					1,
					[
						2,
						"Functions"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				763,
				[
				[
					19,
					cr.plugins_.Function.prototype.cnds.OnFunction,
					null,
					2,
					false,
					false,
					false,
					764
					,[
					[
						1,
						[
							2,
							"growText"
						]
					]
					]
				]
				],
				[
				[
					20,
					cr.plugins_.Text.prototype.acts.SetVisible,
					null,
					765
					,[
					[
						3,
						1
					]
					]
				]
,				[
					20,
					cr.plugins_.Text.prototype.acts.SetText,
					null,
					766
					,[
					[
						7,
						[
							20,
							19,
							cr.plugins_.Function.prototype.exps.Param,
							false,
							null
							,[
[
								0,
								0
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					767
					,[
					[
						11,
						"gTextStart"
					]
,					[
						7,
						[
							19,
							cr.system_object.prototype.exps.time
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					768
					,[
					[
						11,
						"gTextOn"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.Wait,
					null,
					769
					,[
					[
						0,
						[
							0,
							3
						]
					]
					]
				]
,				[
					20,
					cr.plugins_.Text.prototype.acts.SetVisible,
					null,
					770
					,[
					[
						3,
						0
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					771
					,[
					[
						11,
						"gTextOn"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				772,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					773
					,[
					[
						11,
						"gTextOn"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					20,
					cr.plugins_.Text.prototype.acts.SetFontSize,
					null,
					774
					,[
					[
						0,
						[
							4,
							[
								19,
								cr.system_object.prototype.exps.round
								,[
[
									19,
									cr.system_object.prototype.exps.lerp
									,[
[
										0,
										1
									]
,[
										0,
										200
									]
,[
										7,
										[
											5,
											[
												19,
												cr.system_object.prototype.exps.time
											]
											,[
												23,
												"gTextStart"
											]
										]
										,[
											23,
											"gTextTime"
										]
									]
									]
								]
								]
							]
							,[
								0,
								1
							]
						]
					]
					]
				]
,				[
					20,
					cr.plugins_.Text.prototype.acts.SetOpacity,
					null,
					775
					,[
					[
						0,
						[
							19,
							cr.system_object.prototype.exps.lerp
							,[
[
								0,
								100
							]
,[
								0,
								0
							]
,[
								7,
								[
									5,
									[
										19,
										cr.system_object.prototype.exps.time
									]
									,[
										23,
										"gTextStart"
									]
								]
								,[
									23,
									"gTextTime"
								]
							]
							]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				623,
				[
				[
					19,
					cr.plugins_.Function.prototype.cnds.OnFunction,
					null,
					2,
					false,
					false,
					false,
					624
					,[
					[
						1,
						[
							2,
							"goal"
						]
					]
					]
				]
				],
				[
				[
					37,
					cr.plugins_.Audio.prototype.acts.Play,
					null,
					970
					,[
					[
						2,
						["missed",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							0
						]
					]
,					[
						1,
						[
							2,
							"missed"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					646
					,[
					[
						11,
						"oscore"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					631,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						632
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					],
					[
					[
						14,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						633
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					634,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						635
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								2
							]
						]
						]
					]
					],
					[
					[
						15,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						636
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					637,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						638
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								3
							]
						]
						]
					]
					],
					[
					[
						16,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						639
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					640,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						641
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								4
							]
						]
						]
					]
					],
					[
					[
						17,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						642
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					643,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						644
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								5
							]
						]
						]
					]
					],
					[
					[
						18,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						645
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				625,
				[
				[
					19,
					cr.plugins_.Function.prototype.cnds.OnFunction,
					null,
					2,
					false,
					false,
					false,
					626
					,[
					[
						1,
						[
							2,
							"missed"
						]
					]
					]
				]
				],
				[
				[
					37,
					cr.plugins_.Audio.prototype.acts.Play,
					null,
					973
					,[
					[
						2,
						["goalsfx",false]
					]
,					[
						3,
						0
					]
,					[
						0,
						[
							0,
							10
						]
					]
,					[
						1,
						[
							2,
							"goal"
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					681,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						682
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					],
					[
					[
						14,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						683
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					684,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						685
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								2
							]
						]
						]
					]
					],
					[
					[
						15,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						686
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					687,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						688
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								3
							]
						]
						]
					]
					],
					[
					[
						16,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						689
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					690,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						691
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								4
							]
						]
						]
					]
					],
					[
					[
						17,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						692
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					693,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						694
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							0
						]
,						[
							7,
							[
								0,
								5
							]
						]
						]
					]
					],
					[
					[
						18,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						695
						,[
						[
							0,
							[
								0,
								2
							]
						]
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			[true, "Control"],
			false,
			480,
			[
			[
				-1,
				cr.system_object.prototype.cnds.IsGroupActive,
				null,
				0,
				false,
				false,
				false,
				480
				,[
				[
					1,
					[
						2,
						"Control"
					]
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				true,
				1132,
				[
				[
					2,
					cr.plugins_.Touch.prototype.cnds.OnTouchObject,
					null,
					1,
					false,
					false,
					false,
					1133
					,[
					[
						4,
						42
					]
					]
				]
,				[
					45,
					cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
					null,
					1,
					false,
					false,
					false,
					9945166534253311
					,[
					[
						3,
						0
					]
,					[
						3,
						0
					]
,					[
						4,
						42
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					1134,
					[
					[
						42,
						cr.plugins_.Sprite.prototype.cnds.CompareFrame,
						null,
						0,
						false,
						false,
						false,
						1135
						,[
						[
							8,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
						]
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.SetMasterVolume,
						null,
						1150
						,[
						[
							0,
							[
								0,
								-10000
							]
						]
						]
					]
,					[
						42,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						1137
						,[
						[
							0,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						1138
						,[
						[
							11,
							"noSounds"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					1139,
					[
					[
						-1,
						cr.system_object.prototype.cnds.Else,
						null,
						0,
						false,
						false,
						false,
						1140
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.SetMasterVolume,
						null,
						1151
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						42,
						cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
						null,
						1142
						,[
						[
							0,
							[
								0,
								0
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						1143
						,[
						[
							11,
							"noSounds"
						]
,						[
							7,
							[
								0,
								0
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				true,
				832,
				[
				[
					2,
					cr.plugins_.Touch.prototype.cnds.OnTouchObject,
					null,
					1,
					false,
					false,
					false,
					1096
					,[
					[
						4,
						28
					]
					]
				]
,				[
					45,
					cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
					null,
					1,
					false,
					false,
					false,
					9798488641406216
					,[
					[
						3,
						0
					]
,					[
						3,
						0
					]
,					[
						4,
						28
					]
					]
				]
				],
				[
				]
				,[
				[
					0,
					null,
					false,
					6692612682540653,
					[
					[
						28,
						cr.plugins_.Sprite.prototype.cnds.IsVisible,
						null,
						0,
						false,
						false,
						false,
						1097
					]
					],
					[
					[
						37,
						cr.plugins_.Audio.prototype.acts.Play,
						null,
						977
						,[
						[
							2,
							["whistle",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
,						[
							1,
							[
								2,
								"ballkick"
							]
						]
						]
					]
,					[
						28,
						cr.plugins_.Sprite.prototype.acts.SetVisible,
						null,
						1098
						,[
						[
							3,
							0
						]
						]
					]
,					[
						41,
						cr.plugins_.Text.prototype.acts.SetVisible,
						null,
						1099
						,[
						[
							3,
							0
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						803
						,[
						[
							11,
							"numOfKicks"
						]
,						[
							7,
							[
								20,
								27,
								cr.plugins_.XML.prototype.exps.NumberValue,
								false,
								null
								,[
[
									2,
									"count(/penalty/kicks/kick)"
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						805
						,[
						[
							11,
							"selectedKick"
						]
,						[
							7,
							[
								4,
								[
									19,
									cr.system_object.prototype.exps["int"]
									,[
[
										19,
										cr.system_object.prototype.exps.random
										,[
[
											23,
											"numOfKicks"
										]
										]
									]
									]
								]
								,[
									0,
									1
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						485
						,[
						[
							11,
							"vx"
						]
,						[
							7,
							[
								20,
								27,
								cr.plugins_.XML.prototype.exps.NumberValue,
								false,
								null
								,[
[
									10,
									[
										10,
										[
											2,
											"/penalty/kicks/kick["
										]
										,[
											23,
											"selectedKick"
										]
									]
									,[
										2,
										"]/vx/text()"
									]
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						486
						,[
						[
							11,
							"vy"
						]
,						[
							7,
							[
								20,
								27,
								cr.plugins_.XML.prototype.exps.NumberValue,
								false,
								null
								,[
[
									10,
									[
										10,
										[
											2,
											"/penalty/kicks/kick["
										]
										,[
											23,
											"selectedKick"
										]
									]
									,[
										2,
										"]/vy/text()"
									]
								]
								]
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						484
						,[
						[
							11,
							"vz"
						]
,						[
							7,
							[
								0,
								2000
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						978
						,[
						[
							0,
							[
								1,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.SetVar,
						null,
						16
						,[
						[
							11,
							"moving"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						37,
						cr.plugins_.Audio.prototype.acts.Play,
						null,
						976
						,[
						[
							2,
							["ballkick",false]
						]
,						[
							3,
							0
						]
,						[
							0,
							[
								0,
								0
							]
						]
,						[
							1,
							[
								2,
								"ballkick"
							]
						]
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				70,
				[
				[
					-1,
					cr.system_object.prototype.cnds.CompareVar,
					null,
					0,
					false,
					false,
					false,
					1089
					,[
					[
						11,
						"roundEnded"
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1093
					,[
					[
						11,
						"roundEnded"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
				,[
				[
					0,
					null,
					false,
					669,
					[
					[
						-1,
						cr.system_object.prototype.cnds.CompareVar,
						null,
						0,
						false,
						false,
						false,
						670
						,[
						[
							11,
							"myround"
						]
,						[
							8,
							2
						]
,						[
							7,
							[
								0,
								5
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.cnds.Compare,
						null,
						0,
						false,
						false,
						false,
						981
						,[
						[
							7,
							[
								19,
								cr.system_object.prototype.exps.abs
								,[
[
									5,
									[
										23,
										"oscore"
									]
									,[
										23,
										"pscore"
									]
								]
								]
							]
						]
,						[
							8,
							3
						]
,						[
							7,
							[
								5,
								[
									0,
									5
								]
								,[
									23,
									"myround"
								]
							]
						]
						]
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.AddVar,
						null,
						668
						,[
						[
							11,
							"myround"
						]
,						[
							7,
							[
								0,
								1
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						1090
						,[
						[
							0,
							[
								0,
								5
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.GoToLayout,
						null,
						73
						,[
						[
							6,
							"Kick"
						]
						]
					]
					]
				]
,				[
					0,
					null,
					false,
					878,
					[
					[
						-1,
						cr.system_object.prototype.cnds.Else,
						null,
						0,
						false,
						false,
						false,
						879
					]
					],
					[
					[
						-1,
						cr.system_object.prototype.acts.Wait,
						null,
						1091
						,[
						[
							0,
							[
								0,
								5
							]
						]
						]
					]
,					[
						-1,
						cr.system_object.prototype.acts.GoToLayout,
						null,
						880
						,[
						[
							6,
							"Results"
						]
						]
					]
					]
				]
				]
			]
			]
		]
		]
	]
,	[
		"Start events",
		[
		[
			1,
			"Points",
			0,
			0,
false,false,915
		]
,		[
			1,
			"ptLose",
			0,
			0,
false,false,907
		]
,		[
			1,
			"ptTie",
			0,
			0,
false,false,906
		]
,		[
			1,
			"ptWon",
			0,
			0,
false,false,905
		]
,		[
			1,
			"ptOnTarget",
			0,
			0,
false,false,904
		]
,		[
			1,
			"ptCrossbar",
			0,
			0,
false,false,903
		]
,		[
			1,
			"ptGoal",
			0,
			0,
false,false,902
		]
,		[
			1,
			"ptSaved",
			0,
			0,
false,false,901
		]
,		[
			1,
			"compKickWaitTime",
			0,
			0,
false,false,1305878551268177
		]
,		[
			1,
			"d2",
			1,
			"",
false,false,1036
		]
,		[
			1,
			"d",
			1,
			"",
false,false,1037
		]
,		[
			1,
			"a",
			0,
			0,
false,false,1046
		]
,		[
			1,
			"webfont",
			1,
			"Holtwood One SC",
false,false,1077
		]
,		[
			1,
			"noSounds",
			0,
			0,
false,false,1104
		]
,		[
			1,
			"txtSaved",
			1,
			"",
false,false,1178
		]
,		[
			1,
			"txtCrossbar",
			1,
			"",
false,false,1179
		]
,		[
			1,
			"txtMissed",
			1,
			"",
false,false,1180
		]
,		[
			1,
			"txtRound",
			1,
			"",
false,false,1188
		]
,		[
			1,
			"touchGame",
			0,
			0,
false,false,8635147901264909
		]
,		[
			1,
			"txtGoal",
			1,
			"",
false,false,1177
		]
,		[
			0,
			null,
			false,
			863,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false,
				864
			]
			],
			[
			[
				30,
				cr.plugins_.Text.prototype.acts.SetWebFont,
				null,
				1079
				,[
				[
					1,
					[
						23,
						"webfont"
					]
				]
,				[
					1,
					[
						10,
						[
							2,
							"http://fonts.googleapis.com/css?family="
						]
						,[
							23,
							"webfont"
						]
					]
				]
				]
			]
,			[
				26,
				cr.plugins_.AJAX.prototype.acts.RequestFile,
				null,
				865
				,[
				[
					1,
					[
						2,
						"parameters"
					]
				]
,				[
					12,
					pathGame + "parameters.xml"
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Preload,
				null,
				956
				,[
				[
					2,
					["bgnoise",false]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Preload,
				null,
				960
				,[
				[
					2,
					["ballkick",false]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Preload,
				null,
				961
				,[
				[
					2,
					["missed",false]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Preload,
				null,
				962
				,[
				[
					2,
					["goalsfx",false]
				]
				]
			]
,			[
				37,
				cr.plugins_.Audio.prototype.acts.Preload,
				null,
				974
				,[
				[
					2,
					["whistle",false]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1038
				,[
				[
					11,
					"d"
				]
,				[
					7,
					[
						19,
						cr.system_object.prototype.exps.tokenat
						,[
[
							20,
							40,
							cr.plugins_.Browser.prototype.exps.Domain,
							true,
							null
						]
,[
							5,
							[
								19,
								cr.system_object.prototype.exps.tokencount
								,[
[
									20,
									40,
									cr.plugins_.Browser.prototype.exps.Domain,
									true,
									null
								]
,[
									2,
									"."
								]
								]
							]
							,[
								0,
								2
							]
						]
,[
							2,
							"."
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1039
				,[
				[
					11,
					"d2"
				]
,				[
					7,
					[
						19,
						cr.system_object.prototype.exps.tokenat
						,[
[
							20,
							40,
							cr.plugins_.Browser.prototype.exps.Domain,
							true,
							null
						]
,[
							5,
							[
								19,
								cr.system_object.prototype.exps.tokencount
								,[
[
									20,
									40,
									cr.plugins_.Browser.prototype.exps.Domain,
									true,
									null
								]
,[
									2,
									"."
								]
								]
							]
							,[
								0,
								3
							]
						]
,[
							2,
							"."
						]
						]
					]
				]
				]
			]
,			[
				42,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				1105
				,[
				[
					0,
					[
						23,
						"noSounds"
					]
				]
				]
			]
,			[
				43,
				cr.plugins_.cjs.prototype.acts.ExecuteJS,
				null,
				1168
				,[
				[
					1,
					[
						2,
						"tellq();"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1169
				,[
				[
					11,
					"q"
				]
,				[
					7,
					[
						19,
						cr.system_object.prototype.exps.str
						,[
[
							20,
							43,
							cr.plugins_.cjs.prototype.exps.ReadExecutionReturn,
							true,
							null
						]
						]
					]
				]
				]
			]
,			[
				43,
				cr.plugins_.cjs.prototype.acts.ExecuteJS,
				null,
				1170
				,[
				[
					1,
					[
						2,
						"tellfn();"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1171
				,[
				[
					11,
					"function"
				]
,				[
					7,
					[
						19,
						cr.system_object.prototype.exps.str
						,[
[
							20,
							43,
							cr.plugins_.cjs.prototype.exps.ReadExecutionReturn,
							true,
							null
						]
						]
					]
				]
				]
			]
			]
			,[
			[
				0,
				null,
				false,
				1047,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1048
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d"
							]
,[
								0,
								0
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"m"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1049
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d"
							]
,[
								0,
								1
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"o"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1050
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d"
							]
,[
								0,
								2
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"r"
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1052
					,[
					[
						11,
						"a"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				1053,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1054
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d"
							]
,[
								0,
								0
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"1"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1055
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d"
							]
,[
								0,
								1
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"6"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1056
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d"
							]
,[
								0,
								2
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"4"
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1058
					,[
					[
						11,
						"a"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				1059,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1060
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d2"
							]
,[
								0,
								0
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"c"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1061
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d2"
							]
,[
								0,
								1
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"h"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1062
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d2"
							]
,[
								0,
								2
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"o"
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1064
					,[
					[
						11,
						"a"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				1065,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1066
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d2"
							]
,[
								0,
								0
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"p"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1067
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d2"
							]
,[
								0,
								1
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"a"
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					1068
					,[
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.mid
							,[
[
								23,
								"d2"
							]
,[
								0,
								2
							]
,[
								0,
								1
							]
							]
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							2,
							"n"
						]
					]
					]
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1070
					,[
					[
						11,
						"a"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				1071,
				[
				[
					-1,
					cr.system_object.prototype.cnds.IsPreview,
					null,
					0,
					false,
					false,
					false,
					1072
				]
				],
				[
				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1074
					,[
					[
						11,
						"a"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			866,
			[
			[
				26,
				cr.plugins_.AJAX.prototype.cnds.OnComplete,
				null,
				1,
				false,
				false,
				false,
				867
				,[
				[
					1,
					[
						2,
						"parameters"
					]
				]
				]
			]
			],
			[
			[
				27,
				cr.plugins_.XML.prototype.acts.Load,
				null,
				868
				,[
				[
					1,
					[
						20,
						26,
						cr.plugins_.AJAX.prototype.exps.LastData,
						true,
						null
					]
				]
				]
			]
,			[
				30,
				cr.plugins_.Text.prototype.acts.SetWebFont,
				null,
				1152
				,[
				[
					1,
					[
						23,
						"webfont"
					]
				]
,				[
					1,
					[
						10,
						[
							2,
							"http://fonts.googleapis.com/css?family="
						]
						,[
							23,
							"webfont"
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1078
				,[
				[
					11,
					"webfont"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/webfont/text()"
						]
						]
					]
				]
				]
			]
,			[
				30,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				869
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/mainTitle/text()"
						]
						]
					]
				]
				]
			]
,			[
				31,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				870
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/start/text()"
						]
						]
					]
				]
				]
			]
,			[
				32,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				871
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/instructions/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				908
				,[
				[
					11,
					"ptCrossbar"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointCrossbar/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				909
				,[
				[
					11,
					"ptGoal"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointGoal/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				910
				,[
				[
					11,
					"ptLose"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointLose/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				911
				,[
				[
					11,
					"ptOnTarget"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointOnTarget/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				912
				,[
				[
					11,
					"ptSaved"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointSaved/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				913
				,[
				[
					11,
					"ptTie"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointTie/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				914
				,[
				[
					11,
					"ptWon"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/pointWon/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1181
				,[
				[
					11,
					"txtCrossbar"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/crossbar/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1185
				,[
				[
					11,
					"txtGoal"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/goal/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1186
				,[
				[
					11,
					"txtMissed"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/missed/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1187
				,[
				[
					11,
					"txtSaved"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/saved/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				1189
				,[
				[
					11,
					"txtRound"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/round/text()"
						]
						]
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				4297701720414788
				,[
				[
					11,
					"compKickWaitTime"
				]
,				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.NumberValue,
						false,
						null
						,[
[
							2,
							"/penalty/compKickWaitTime/text()"
						]
						]
					]
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			872,
			[
			[
				2,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false,
				873
				,[
				[
					4,
					28
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.cnds.CompareVar,
				null,
				0,
				false,
				false,
				false,
				1075
				,[
				[
					11,
					"a"
				]
,				[
					8,
					0
				]
,				[
					7,
					[
						0,
						1
					]
				]
				]
			]
			],
			[
			[
				37,
				cr.plugins_.Audio.prototype.acts.Play,
				null,
				954
				,[
				[
					2,
					["bgnoise",false]
				]
,				[
					3,
					1
				]
,				[
					0,
					[
						0,
						0
					]
				]
,				[
					1,
					[
						2,
						"bgcrowd"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				8358736669593954
				,[
				[
					11,
					"touchGame"
				]
,				[
					7,
					[
						0,
						1
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null,
				874
				,[
				[
					6,
					"Kick"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			5486963803261014,
			[
			[
				45,
				cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
				null,
				1,
				false,
				false,
				false,
				8883901514859733
				,[
				[
					3,
					0
				]
,				[
					3,
					0
				]
,				[
					4,
					28
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.cnds.CompareVar,
				null,
				0,
				false,
				false,
				false,
				5659200616115357
				,[
				[
					11,
					"a"
				]
,				[
					8,
					0
				]
,				[
					7,
					[
						0,
						1
					]
				]
				]
			]
			],
			[
			[
				37,
				cr.plugins_.Audio.prototype.acts.Play,
				null,
				9738196155836785
				,[
				[
					2,
					["bgnoise",false]
				]
,				[
					3,
					1
				]
,				[
					0,
					[
						0,
						0
					]
				]
,				[
					1,
					[
						2,
						"bgcrowd"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null,
				5668020353413842
				,[
				[
					6,
					"Kick"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			875,
			[
			[
				2,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false,
				876
				,[
				[
					4,
					29
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.cnds.CompareVar,
				null,
				0,
				false,
				false,
				false,
				1076
				,[
				[
					11,
					"a"
				]
,				[
					8,
					0
				]
,				[
					7,
					[
						0,
						1
					]
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null,
				877
				,[
				[
					6,
					"Instructions"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			true,
			1108,
			[
			[
				2,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false,
				1109
				,[
				[
					4,
					42
				]
				]
			]
,			[
				45,
				cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
				null,
				1,
				false,
				false,
				false,
				4983174059859945
				,[
				[
					3,
					0
				]
,				[
					3,
					0
				]
,				[
					4,
					42
				]
				]
			]
			],
			[
			]
			,[
			[
				0,
				null,
				false,
				1110,
				[
				[
					42,
					cr.plugins_.Sprite.prototype.cnds.CompareFrame,
					null,
					0,
					false,
					false,
					false,
					1111
					,[
					[
						8,
						0
					]
,					[
						0,
						[
							0,
							0
						]
					]
					]
				]
				],
				[
				[
					37,
					cr.plugins_.Audio.prototype.acts.SetMasterVolume,
					null,
					1146
					,[
					[
						0,
						[
							0,
							-10000
						]
					]
					]
				]
,				[
					42,
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
					null,
					1113
					,[
					[
						0,
						[
							0,
							1
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1114
					,[
					[
						11,
						"noSounds"
					]
,					[
						7,
						[
							0,
							1
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				1115,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Else,
					null,
					0,
					false,
					false,
					false,
					1116
				]
				],
				[
				[
					37,
					cr.plugins_.Audio.prototype.acts.SetMasterVolume,
					null,
					1147
					,[
					[
						0,
						[
							0,
							0
						]
					]
					]
				]
,				[
					42,
					cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
					null,
					1118
					,[
					[
						0,
						[
							0,
							0
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1119
					,[
					[
						11,
						"noSounds"
					]
,					[
						7,
						[
							0,
							0
						]
					]
					]
				]
				]
			]
			]
		]
		]
	]
,	[
		"Instructions e",
		[
		[
			0,
			null,
			false,
			893,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false,
				894
			]
			],
			[
			[
				31,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				895
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/start/text()"
						]
						]
					]
				]
				]
			]
,			[
				33,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				896
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/instructions/text()"
						]
						]
					]
				]
				]
			]
,			[
				34,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				897
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/instructionsText/text()"
						]
						]
					]
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			898,
			[
			[
				2,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false,
				899
				,[
				[
					4,
					28
				]
				]
			]
			],
			[
			[
				37,
				cr.plugins_.Audio.prototype.acts.Play,
				null,
				955
				,[
				[
					2,
					["bgnoise",false]
				]
,				[
					3,
					1
				]
,				[
					0,
					[
						0,
						0
					]
				]
,				[
					1,
					[
						2,
						"bgcrowd"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				7592236195924907
				,[
				[
					11,
					"touchGame"
				]
,				[
					7,
					[
						0,
						1
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null,
				900
				,[
				[
					6,
					"Kick"
				]
				]
			]
			]
		]
,		[
			0,
			null,
			false,
			3917796117122097,
			[
			[
				45,
				cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
				null,
				1,
				false,
				false,
				false,
				2806766592191515
				,[
				[
					3,
					0
				]
,				[
					3,
					0
				]
,				[
					4,
					28
				]
				]
			]
			],
			[
			[
				37,
				cr.plugins_.Audio.prototype.acts.Play,
				null,
				3674800935654816
				,[
				[
					2,
					["bgnoise",false]
				]
,				[
					3,
					1
				]
,				[
					0,
					[
						0,
						0
					]
				]
,				[
					1,
					[
						2,
						"bgcrowd"
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null,
				7653735405928278
				,[
				[
					6,
					"Kick"
				]
				]
			]
			]
		]
		]
	]
,	[
		"Results events",
		[
		[
			1,
			"function",
			1,
			"",
false,false,1162
		]
,		[
			1,
			"q",
			1,
			"",
false,false,1163
		]
,		[
			1,
			"secret",
			1,
			"wH4DsxHyu8dAqsdeAqCbHfsD",
false,false,1164
		]
,		[
			1,
			"call",
			1,
			"",
false,false,1165
		]
,		[
			1,
			"key",
			1,
			"",
false,false,1166
		]
,		[
			0,
			null,
			false,
			881,
			[
			[
				-1,
				cr.system_object.prototype.cnds.OnLayoutStart,
				null,
				1,
				false,
				false,
				false,
				882
			]
			],
			[
			[
				35,
				cr.plugins_.Text.prototype.acts.SetWebFont,
				null,
				1161
				,[
				[
					1,
					[
						23,
						"webfont"
					]
				]
,				[
					1,
					[
						10,
						[
							2,
							"http://fonts.googleapis.com/css?family="
						]
						,[
							23,
							"webfont"
						]
					]
				]
				]
			]
,			[
				31,
				cr.plugins_.Text.prototype.acts.SetText,
				null,
				922
				,[
				[
					7,
					[
						20,
						27,
						cr.plugins_.XML.prototype.exps.StringValue,
						true,
						null
						,[
[
							2,
							"/penalty/start/text()"
						]
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				941
				,[
				[
					0,
					[
						6,
						[
							23,
							"goalWidth"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							23,
							"goalHeight"
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetPos,
				null,
				942
				,[
				[
					0,
					[
						7,
						[
							19,
							cr.system_object.prototype.exps.layoutwidth
						]
						,[
							0,
							2
						]
					]
				]
,				[
					0,
					[
						5,
						[
							6,
							[
								23,
								"cameraHeight"
							]
							,[
								7,
								[
									23,
									"dispz"
								]
								,[
									23,
									"goalDist"
								]
							]
						]
						,[
							23,
							"yOffset"
						]
					]
				]
				]
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.StopAnim,
				null,
				943
			]
,			[
				1,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				944
				,[
				[
					0,
					[
						0,
						0
					]
				]
				]
			]
,			[
				5,
				cr.plugins_.Sprite.prototype.acts.SetSize,
				null,
				945
				,[
				[
					0,
					[
						6,
						[
							4,
							[
								6,
								[
									23,
									"goalBarWidth"
								]
								,[
									0,
									2
								]
							]
							,[
								23,
								"goalWidth"
							]
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
,				[
					0,
					[
						6,
						[
							4,
							[
								23,
								"goalBarHeight"
							]
							,[
								23,
								"goalHeight"
							]
						]
						,[
							7,
							[
								23,
								"dispz"
							]
							,[
								23,
								"goalDist"
							]
						]
					]
				]
				]
			]
,			[
				5,
				cr.plugins_.Sprite.prototype.acts.SetPosToObject,
				null,
				946
				,[
				[
					4,
					1
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
			]
			,[
			[
				0,
				null,
				false,
				983,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					984
					,[
					[
						7,
						[
							23,
							"pscore"
						]
					]
,					[
						8,
						4
					]
,					[
						7,
						[
							23,
							"oscore"
						]
					]
					]
				]
				],
				[
				[
					35,
					cr.plugins_.Text.prototype.acts.SetText,
					null,
					996
					,[
					[
						7,
						[
							20,
							27,
							cr.plugins_.XML.prototype.exps.StringValue,
							true,
							null
							,[
[
								2,
								"/penalty/youWon/text()"
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					993
					,[
					[
						11,
						"Points"
					]
,					[
						7,
						[
							23,
							"ptWon"
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				987,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					988
					,[
					[
						7,
						[
							23,
							"pscore"
						]
					]
,					[
						8,
						0
					]
,					[
						7,
						[
							23,
							"oscore"
						]
					]
					]
				]
				],
				[
				[
					35,
					cr.plugins_.Text.prototype.acts.SetText,
					null,
					997
					,[
					[
						7,
						[
							20,
							27,
							cr.plugins_.XML.prototype.exps.StringValue,
							true,
							null
							,[
[
								2,
								"/penalty/itsTie/text()"
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					994
					,[
					[
						11,
						"Points"
					]
,					[
						7,
						[
							23,
							"ptTie"
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				990,
				[
				[
					-1,
					cr.system_object.prototype.cnds.Compare,
					null,
					0,
					false,
					false,
					false,
					991
					,[
					[
						7,
						[
							23,
							"pscore"
						]
					]
,					[
						8,
						2
					]
,					[
						7,
						[
							23,
							"oscore"
						]
					]
					]
				]
				],
				[
				[
					35,
					cr.plugins_.Text.prototype.acts.SetText,
					null,
					998
					,[
					[
						7,
						[
							20,
							27,
							cr.plugins_.XML.prototype.exps.StringValue,
							true,
							null
							,[
[
								2,
								"/penalty/youLose/text()"
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.AddVar,
					null,
					995
					,[
					[
						11,
						"Points"
					]
,					[
						7,
						[
							23,
							"ptLose"
						]
					]
					]
				]
				]
			]
,			[
				0,
				null,
				false,
				985,
				[
				],
				[
				[
					35,
					cr.plugins_.Text.prototype.acts.AppendText,
					null,
					921
					,[
					[
						7,
						[
							10,
							[
								10,
								[
									10,
									[
										10,
										[
											10,
											[
												2,
												" "
											]
											,[
												20,
												27,
												cr.plugins_.XML.prototype.exps.StringValue,
												true,
												null
												,[
[
													2,
													"/penalty/youMade/text()"
												]
												]
											]
										]
										,[
											2,
											" "
										]
									]
									,[
										23,
										"Points"
									]
								]
								,[
									2,
									" "
								]
							]
							,[
								20,
								27,
								cr.plugins_.XML.prototype.exps.StringValue,
								true,
								null
								,[
[
									2,
									"/penalty/points/text()"
								]
								]
							]
						]
					]
					]
				]
,				[
					43,
					cr.plugins_.cjs.prototype.acts.ExecuteJS,
					null,
					1173
					,[
					[
						1,
						[
							10,
							[
								10,
								[
									2,
									"updateScore("
								]
								,[
									23,
									"Points"
								]
							]
							,[
								2,
								");"
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1174
					,[
					[
						11,
						"key"
					]
,					[
						7,
						[
							20,
							44,
							cr.plugins_.CBhash.prototype.exps.MD5,
							true,
							null
							,[
[
								10,
								[
									10,
									[
										23,
										"q"
									]
									,[
										23,
										"secret"
									]
								]
								,[
									19,
									cr.system_object.prototype.exps.str
									,[
[
										23,
										"Points"
									]
									]
								]
							]
							]
						]
					]
					]
				]
,				[
					-1,
					cr.system_object.prototype.acts.SetVar,
					null,
					1175
					,[
					[
						11,
						"call"
					]
,					[
						7,
						[
							10,
							[
								10,
								[
									10,
									[
										10,
										[
											10,
											[
												23,
												"function"
											]
											,[
												2,
												"('"
											]
										]
										,[
											23,
											"key"
										]
									]
									,[
										2,
										"',"
									]
								]
								,[
									23,
									"Points"
								]
							]
							,[
								2,
								");"
							]
						]
					]
					]
				]
,				[
					43,
					cr.plugins_.cjs.prototype.acts.ExecuteJS,
					null,
					1176
					,[
					[
						1,
						[
							23,
							"call"
						]
					]
					]
				]
				]
			]
			]
		]
,		[
			0,
			null,
			true,
			923,
			[
			[
				2,
				cr.plugins_.Touch.prototype.cnds.OnTouchObject,
				null,
				1,
				false,
				false,
				false,
				924
				,[
				[
					4,
					28
				]
				]
			]
,			[
				45,
				cr.plugins_.Mouse.prototype.cnds.OnObjectClicked,
				null,
				1,
				false,
				false,
				false,
				5350937258071339
				,[
				[
					3,
					0
				]
,				[
					3,
					0
				]
,				[
					4,
					28
				]
				]
			]
			],
			[
			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				926
				,[
				[
					11,
					"Points"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				927
				,[
				[
					11,
					"myround"
				]
,				[
					7,
					[
						0,
						1
					]
				]
				]
			]
,			[
				47,
				cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
				null,
				933
				,[
				[
					0,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				936
				,[
				[
					11,
					"oscore"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.SetVar,
				null,
				937
				,[
				[
					11,
					"pscore"
				]
,				[
					7,
					[
						0,
						0
					]
				]
				]
			]
,			[
				-1,
				cr.system_object.prototype.acts.GoToLayout,
				null,
				925
				,[
				[
					6,
					"Kick"
				]
				]
			]
			]
		]
		]
	]
	],
	pathGame + "media/",
	true,
	900,
	450,
	0,
	true,
	true,
	true,
	"1.0",
	2,
	false,
	0,
	false,
	75,
	false,
	[
	]
];};
