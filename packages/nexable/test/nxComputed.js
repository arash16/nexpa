describe("nx.computed", function() {
	it("Should advertise that instances are nexable", function() {
		var inst = nx.computed(function() {});
		expect(nx.isNexable(inst)).to.be.true;
	});

	it("Should not advertise that instances are writable", function() {
		var inst = nx.computed(function() {});
		expect(nx.isWritable(inst)).to.be.false;
	});

	it("Should advertise that instances are computed", function() {
		var inst = nx.computed(function() {});
		expect(nx.isComputed(inst)).to.be.true;
	});

	it("Should not advertise that instances are nexable arrays", function() {
		var inst = nx.computed(function() {});
		expect(nx.isNexableArray(inst)).to.be.false;
	});

	it("Should not advertise that nx.computed is nexable", function() {
		expect(nx.isNexable(nx.computed)).to.be.false;
	});

	it("Should not advertise that non-nexable values are computed", function() {
		var vals = [undefined, null, 'x', {}, function(){}, /sdf/g, 1, true, []];
		for (var i=0; i<vals.length; ++i)
			expect(nx.isComputed(vals[i])).to.be.false;
	});

	it("Should ignore values written to it", function() {
		var inst = nx.computed(function() { return 1; });
		inst(2);
		expect(inst.peek()).to.equal(1);
	});

	it("Should return new written values only after a nx.signal call", function() {
		var st = nx.state(1);
		var cp = nx.computed(function() { return st(); });
		expect(cp()).to.equal(1);
		st(2);
		expect(cp()).to.equal(1);
		nx.signal();
		expect(cp()).to.equal(2);
	});

	it("Should be able to peek latest evaluated values", function() {
		var st = nx.state(1);
		var cp = nx.computed(function() { return st(); });
		expect(cp.peek()).to.be.undefined;
		cp();
		expect(cp.peek()).to.equal(1);
		st(2);
		expect(cp.peek()).to.equal(1);
		nx.signal();
		expect(cp.peek()).to.equal(1);
		cp();
		expect(cp.peek()).to.equal(2);
	});
});
