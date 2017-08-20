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
			var aDisposed = 0, bDisposed = 0,
				a = nx.computed({
					read: function() { return b()|0 },
					onDisposed: function() { ++aDisposed; }
				}),
				b = nx.computed({
					read: function() { return a(); },
					onDisposed: function() { ++bDisposed; }
				}),
				c = nx(function() { return b(); });

			expect(c()).to.equal(0);
			nx.signal();
			expect(c()).to.equal(0);
			nx.signal();
			expect(bDisposed).to.equal(1);
			expect(aDisposed).to.equal(1);
		});
	});
});
