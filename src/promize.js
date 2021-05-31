class Promize {
	static resolve(val) {
		return new Promize((resolve) => resolve(val))
	}
	static reject(val) {
		return new Promize((_, reject) => reject(val))
	}
	constructor(executer) {
		const self = this
		this.resolveQueue = []
		this.rejectQueue = []
		this.status = 'pending'
		this.value = undefined
		this.reason = undefined
		function onResolve(val) {
			if (self.status !== 'pending') return
			if ((typeof val === 'object' || typeof val === 'function') && val) {
				let then
				try {
					then = val.then
				} catch (e) {
					onReject(e)
					return
				}
				if (typeof then === 'function') {
					let waiting = false
					try {
						then.call(val, (v) => {
							if (waiting) return
							waiting = true
							onResolve(v)
						}, (e) => {
							if (waiting) return
							onReject(e)
						})
					} catch (e) {
						if (waiting) return
						onReject(e)
					}
					return
				}
			}
			self.status = 'fullfilled'
			self.value = val
			setTimeout(() => {
				runQueue(self.resolveQueue, val)
			})
		}
		function onReject(reason) {
			if (self.status !== 'pending') return
			self.reason = reason
			self.status = 'rejected'
			setTimeout(() => {
				runQueue(self.rejectQueue, reason)
			})
		}
		executer(onResolve, onReject)
	}
	then(successFn, rejectFn) {
		let _resolve
		let _reject

		let ret = new Promize(function(resolve, reject) {
			_resolve = resolve
			_reject = reject
		})

		const resolved = typeof successFn === 'function' ? function(arg) {
			let res
			try {
				res = successFn(arg)
			} catch (e) {
				return _reject(e)
			}
			if (res === ret) return _reject(new TypeError('cannot return same promise'))
			res instanceof Promize ? res.then(_resolve, _reject) : _resolve(res)
		} : _resolve

		const rejected = typeof rejectFn === 'function' ? function(reason) {
			let res
			try {
				res = rejectFn(reason)
			} catch (e) {
				return _reject(e)
			}
			if (res === ret) return _reject(new TypeError('cannot return same promise'))
			res instanceof Promize ? res.then(_resolve, _reject) : _resolve(res)
		} : _reject

		if (this.status === 'fullfilled') {
			setTimeout(() => {
				resolved && resolved(this.value)
			})
		} else if (this.status === 'rejected') {
			setTimeout(() => {
				rejected && rejected(this.reason)
			})
		} else {
			resolved && this.resolveQueue.push(resolved)
			rejected && this.rejectQueue.push(rejected)
		}

		return ret
	}
	catch(fn) {
		this.then(null, fn)
	}
}
function runQueue(queue, payload) {
	while (queue.length) queue.shift()(payload)
}


module.exports = Promize
