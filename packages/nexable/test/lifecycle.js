describe("Lifecycle Handlers", function() {
	describe("State", function() {
		it("Should call onDisposed immediately if there's no value written", function() {
			var calls = 0;
			var a = nx.state(0, {
				onDisposed: function() { ++calls; }
			});

			expect(calls).to.equal(0);
			a.dispose();
			expect(calls).to.equal(1);
		});

		it("Should call onDisposed before next cycle only if there's value written", function() {
			var calls = 0;
			var a = nx.state(0, {
				onDisposed: function() { ++calls; }
			});

			expect(calls).to.equal(0);
			a(1);
			a.dispose();
			expect(calls).to.equal(0);
			nx.signal();
			expect(calls).to.equal(1);
		});

		it("Should return last value written before disposal", function() {
			var a = nx(0);
			expect(a()).to.equal(0);
			nx.signal();
			a(1);
			expect(a()).to.equal(0);
			a.dispose();
			expect(a()).to.equal(0);
			nx.signal();
			expect(a()).to.equal(1);
		});
	});

	describe("Computed", function() {
		it("Should be disposed when there's no sources", function() {
			var calls = 0;
			var a = nx.computed({
				read: function(){ return 1; },
				onDisposed: function() { ++calls; }
			});

			expect(calls).to.equal(0);
			expect(a()).to.equal(1);
			expect(calls).to.equal(1);
			nx.signal();
			expect(a()).to.equal(1);
			expect(calls).to.equal(1);
			nx.forceGC();
			expect(a()).to.equal(1);
			expect(calls).to.equal(1);
		});

		it("Should be disposed when sources are disposed", function() {
			var calls = 0;
			var a = nx(0),
				b = nx.computed({
					read: function(){ return a(); },
					onDisposed: function() { ++calls; }
				});

			for (var i=0; i<5; ++i) {
				expect(b()).to.equal(i);
				expect(calls).to.equal(0);
				a(i+1);
				nx.signal();
			}

			expect(b()).to.equal(5);
			a.dispose();
			expect(calls).to.equal(1);
			expect(b()).to.equal(5);
			expect(calls).to.equal(1);
		});

		it("Should not dispose self-refrence & changing nodes", function() {
			var calls = 0;
			var a = nx.computed({
				read: function() { return (a()|0)+1 },
				onDisposed: function() { ++calls; }
			});

			for (var i=1; i<10; ++i)
				expect(a()).to.equal(i),
				expect(calls).to.equal(0),
				nx.signal();
		});

		it("Should dispose self-refrence & constant nodes", function() {
			var calls = 0;
			var a = nx.computed({
				read: function() { return (a()|0) },
				onDisposed: function() { ++calls; }
			});

			expect(a()).to.equal(0);
			nx.signal();
			expect(a()).to.equal(0);
			nx.signal();
			expect(calls).to.equal(1);
		});

		it("Should not dispose circular & changing chains", function() {
			var aDisposed = 0, bDisposed = 0,
				a = nx.computed({
					read: function() { return b()|0 },
					onDisposed: function() { ++aDisposed; }
				}),
				b = nx.computed({
					read: function() { return a()+1; },
					onDisposed: function() { ++bDisposed; }
				});

			for (var i=1; i<10; ++i)
				expect(b()).to.equal(i),
				expect(aDisposed).to.equal(0),
				expect(bDisposed).to.equal(0),
				nx.signal();
		});

		it("Should dispose circular & constant chains", function() {
			var aDisposed = 0, bDisposed = 0, cDisposed = 0,
				a = nx.computed({
					read: function() { return b()|0 },
					onDisposed: function() { ++aDisposed; }
				}),
				b = nx.computed({
					read: function() { return a()|0; },
					onDisposed: function() { ++bDisposed; }
				}),
				c = nx.computed({
					read: function() { return b() },
					onDisposed: function() { ++cDisposed; }
				});

			// after three cycles it's known that nothing's gonna change
			for (var i=0; i<3; ++i)
				expect(aDisposed+bDisposed+cDisposed).to.equal(0),
				expect(c()).to.equal(0),
				nx.signal();

			expect(bDisposed).to.equal(1);
			expect(aDisposed).to.equal(1);
			expect(cDisposed).to.equal(1);
		});

		it("Should dispose circular chain when it becomes constant", function() {
			function onDisposed() { ++onDisposedCalls; }
			var aDisposed = 0, bDisposed = 0, cDisposed = 0, dDisposed = 0,
				x = nx(0),
				a = nx.computed({
					read: function a() { return c()|0 },
					onDisposed: function() { ++aDisposed; }
				}),
				b = nx.computed({
					read: function b() { return c()|0 },
					onDisposed: function() { ++bDisposed; }
				}),
				c = nx.computed({
					read: function c() { return a()+b()+x() },
					onDisposed: function() { ++cDisposed; }
				}),
				d = nx.computed({
					read: function d() { return c(); },
					onDisposed: function() { ++dDisposed; }
				});

				expect(d()).to.equal(0);
				x(1);
				nx.signal();

				expect(d()).to.equal(1);
				x(0);
				nx.signal();

				expect(d()).to.equal(2);
				nx.signal();

				expect(d()).to.equal(4);
				x(-8);
				nx.signal();

				expect(d()).to.equal(0);
				x(0);
				nx.signal();

				expect(d()).to.equal(0);
				expect(aDisposed+bDisposed+cDisposed+dDisposed).to.equal(0);
				nx.signal();

				x.dispose();
				expect(d()).to.equal(0);
				nx.signal();
				expect(d()).to.equal(0);
				// after two evaluations everything gets disposed

				expect(aDisposed).to.equal(1);
				expect(bDisposed).to.equal(1);
				expect(cDisposed).to.equal(1);
				expect(dDisposed).to.equal(1);
		});

		// more circular constant chains cases
	});
});
