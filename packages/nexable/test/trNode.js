describe("Expression Evaluation", function() {
	it("Should Block unnecessary evaluations", function() {
		var calls = 0,
			x = nx(1), y = nx(2),
			f = nx(function() { return x() + y(); }),
			g = nx(function() { calls++; return f() + 1; });

		expect(g()).to.equal(4);
		expect(calls).to.equal(1);

		nx.signal();
		expect(g()).to.equal(4);
		expect(calls).to.equal(1);

		for (var i=2; i<7; ++i) {
			x(i); y(3-i);
			nx.signal();
			expect(g()).to.equal(4);
			expect(calls).to.equal(1);
		}

		x(6); y(2);
		nx.signal();
		expect(g()).to.equal(9);
		expect(calls).to.equal(2);
	});

	it("Should always re-evaluate recursive functions", function() {
		var calls = 0,
			f = nx(function(){ calls++; return (f()|0) + 1; });

		for (var i=1; i<=10; ++i) {
			expect(f()).to.equal(i);
			expect(calls, i);
			nx.signal();
		}
	});

	it("Should always re-evaluate deep recursive functions", function() {
		var calls = 0,
			x = nx(function() { return z()|0; }),
			y = nx(function() { return x(); }),
			z = nx(function() { ++calls; return y()+1; });

		for (var i=1; i<=10; ++i) {
			expect(z()).to.equal(i);
			expect(calls, i);
			nx.signal();
		}
	});

	it("Should dynamically track active dependencies", function() {
		var callsX = 0, callsY = 0, callsF = 0,
			a = nx(1), x = nx(function() { ++callsX; return a(); }),
			b = nx(2), y = nx(function() { ++callsY; return b(); }),
			c = nx(1),
			f = nx(function() { ++callsF; return c()==1 ? x() : y(); });

		expect(f()).to.equal(1);
		expect([callsX, callsY, callsF]).to.deep.equal([1, 0, 1]);

		a(3);
		nx.signal();
		expect(f()).to.equal(3);
		expect([callsX, callsY, callsF]).to.deep.equal([2, 0, 2]);

		b(4);
		nx.signal();
		expect(f()).to.equal(3);
		expect([callsX, callsY, callsF]).to.deep.equal([2, 0, 2]);

		c(2);
		nx.signal();
		expect(f()).to.equal(4);
		expect([callsX, callsY, callsF]).to.deep.equal([2, 1, 3]);

		a(9);
		nx.signal();
		expect(f()).to.equal(4);
		expect([callsX, callsY, callsF]).to.deep.equal([2, 1, 3]);

		b(5);
		nx.signal();
		expect(f()).to.equal(5);
		expect([callsX, callsY, callsF]).to.deep.equal([2, 2, 4]);

		c(1);
		nx.signal();
		expect(f()).to.equal(9);
		expect([callsX, callsY, callsF]).to.deep.equal([3, 2, 5]);
	});

	it("Should dynamically stop recalculation if recursion is no more", function() {
		var calls = 0,
			x = nx(function() {
				++calls;
				var cur = x.peek() | 0;
				return cur < 3 ? (x()|0) + 1 : 3;
			});

		expect(x()).to.equal(1);
		expect(calls).to.equal(1);

		nx.signal();
		expect(x()).to.equal(2);
		expect(calls).to.equal(2);

		nx.signal();
		expect(x()).to.equal(3);
		expect(calls).to.equal(3);

		nx.signal();
		expect(x()).to.equal(3);
		expect(calls).to.equal(4);

		nx.signal();
		expect(x()).to.equal(3);
		expect(calls).to.equal(4);
	});

	it("Should not re-evaluate if a dependency is circular but it's value is not changed", function() {
		var a = nx(function(){ return a()|0; }),
			calls = 0,
			b = nx(function(){ ++calls; return a(); });

		expect(b()).to.equal(0);
		expect(calls).to.equal(1);

		for (var i=0; i<5; ++i) {
			nx.signal();
			expect(b()).to.equal(0);
			expect(calls).to.equal(1);
		}
	});
	
	it("Should make the whole circular chain dirty", function() {
		var a = nx(function() { return b(); }),
			b = nx(function() { return c()|0; }),
			c = nx(function() { return a()+1; }),
			d = nx(function() { return b(); });
		
		for (var i=0; i<10; ++i) {
			expect(a()).to.equal(i);
			expect(b()).to.equal(i);
			expect(d()).to.equal(i);
			nx.signal();
		}
	});
	
	it("Should dynamically stop recalculation if not depnded on a circular chain anymore", function() {
		var chainCalls = 0,
			xCalls = 0;

		var a = nx(function() { return b()|0; }),
			b = nx(function() { return c()|0; }),
			c = nx(function() { return d()|0; }),
			d = nx(function() { ++chainCalls; return a()+1; }),
			
			s = nx(1),
			x = nx(function() { ++xCalls; return s() ? d() : -1; });
		
		for (var i=1; i<5; ++i)
			expect(x()).to.equal(i),
			expect(chainCalls).to.equal(i),
			expect(xCalls).to.equal(i),
			nx.signal();
		
		s(0); // chain disconnected
		nx.signal();
		expect(x()).to.equal(-1); // x evaluated one last
		expect(xCalls).to.equal(5);
		expect(chainCalls).to.equal(4);

		nx.signal();
		expect(x()).to.equal(-1); // x not evaluated again
		expect(xCalls).to.equal(5);
		expect(chainCalls).to.equal(4);

		s(1); // chain connected again
		for (var i=5; i<10; ++i)
			nx.signal(),
			expect(x()).to.equal(i),
			expect(chainCalls).to.equal(i),
			expect(xCalls).to.equal(i+1);
	});
});
