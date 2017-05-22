describe("nx.array", function() {
	it("Should advertise that instances are nexable", function() {
		var inst = nx.array();
		expect(nx.isNexable(inst)).to.be.true;
	});

	it("Should advertise that instances are array", function() {
		var inst = nx.array();
		expect(nx.isNexableArray(inst)).to.be.true;
	});


	it("Should advertise that state instances are writable", function() {
		var inst = nx.array();
		expect(nx.isWritable(inst)).to.be.true;
	});

	it("Should not advertise that state instances are computed", function() {
		var inst = nx.array();
		expect(nx.isComputed(inst)).to.be.false;
	});

	it("Should advertise that computed instances are computed", function() {
		var inst = nx.array().filter(function(){});
		expect(nx.isComputed(inst)).to.be.true;
	});

	it("Should not advertise that computed instances are writable", function() {
		var inst = nx.array().filter(function(){});
		expect(nx.isWritable(inst)).to.be.false;
	});


	it("Should not advertise that nx.array is nexable", function() {
		expect(nx.isNexable(nx.array)).to.be.false;
	});

	it("Should not advertise that non-nexable values are nexable array", function() {
		var vals = [undefined, null, 'x', {}, function(){}, /sdf/g, 1, true, []];
		for (var i=0; i<vals.length; ++i)
			expect(nx.isNexableArray(vals[i])).to.be.false;
	});

	it("Should return new written values only after a nx.signal call", function() {
		var inst = nx.array([1,2,3,4]);
		expect(inst()).to.deep.equal([1,2,3,4]);
		inst(4, 5);
		expect(inst()).to.deep.equal([1,2,3,4]);
		expect(inst(4)).to.be.undefined;
		nx.signal();
		expect(inst()).to.deep.equal([1,2,3,4,5]);
		expect(inst(4)).to.equal(5);
		inst([1,2]);
		expect(inst()).to.deep.equal([1,2,3,4,5]);
		nx.signal();
		expect(inst()).to.deep.equal([1,2]);
		inst(4,5);
		expect(inst()).to.deep.equal([1,2]);
		nx.signal();
		expect(inst()).to.deep.equal([1,2,,,5]);
		expect(inst(0)).to.equal(1);
		expect(inst(1)).to.equal(2);
		expect(inst(4)).to.equal(5);
	});
});
