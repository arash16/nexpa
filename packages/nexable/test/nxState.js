describe("nx.state", function() {
	it("Should advertise that instances are nexable", function() {
		var inst = nx.state();
		expect(nx.isNexable(inst)).to.be.true;
	});

	it("Should advertise that instances are writable", function() {
		var inst = nx.state();
		expect(nx.isWritable(inst)).to.be.true;
	});

	it("Should not advertise that instances are computed", function() {
		var inst = nx.state();
		expect(nx.isComputed(inst)).to.be.false;
	});

	it("Should not advertise that instances are nexable arrays", function() {
		expect(nx.isNexableArray(nx.state())).to.be.false;
		expect(nx.isNexableArray(nx.state(1))).to.be.false;
		expect(nx.isNexableArray(nx.state([]))).to.be.false;
	});

	it("Should not advertise that nx.state is nexable", function() {
		expect(nx.isNexable(nx.state)).to.be.false;
	});

	it("Should not advertise that non-nexable values are nexable", function() {
		var vals = [undefined, null, 'x', {}, function(){}, /sdf/g, 1, true];
		for (var i=0; i<vals.length; ++i)
			expect(nx.isNexable(vals[i])).to.be.false;
	});

	it("Should be able to write values to it and peek read them", function() {
		var inst = nx.state(1);
		inst(2);
		expect(inst.peek()).to.equal(2);
	});

	it("Should return new written values only after a nx.signal call", function() {
		var inst = nx.state(1);
		expect(inst()).to.equal(1);
		inst(2);
		expect(inst()).to.equal(1);
		nx.signal();
		expect(inst()).to.equal(2);
	});
});
