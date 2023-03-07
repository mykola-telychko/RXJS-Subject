import { Subject, from, multicast, interval, refCount } from 'rxjs';

const subject = new Subject<number>();

subject.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
subject.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

const observable = from([1, 2, 3]);

observable.subscribe(subject); // You can subscribe providing a Subject

// Logs:
// observerA: 1
// observerB: 1
// observerA: 2
// observerB: 2
// observerA: 3
// observerB: 3

// exmpl 2
const src = from([1, 2, 3]);
const sub = new Subject();
const multicas = src.pipe(multicast(sub));

// These are, under the hood, `subject.subscribe({...})`:
multicas.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
multicas.subscribe({
  next: (v) => console.log(`observerB: ${v}`),
});

// This is, under the hood, `source.subscribe(subject)`:
multicas.connect();

// exmpl 3
const source = interval(500);
const subj = new Subject();
const multic = source.pipe(multicast(subj));
let sub1, sub2, subscriptionConnect;

sub1 = multic.subscribe({
  next: (v) => console.log(`observerA: ${v}`),
});
// We should call `connect()` here, because the first
// subscriber to `multicasted` is interested in consuming values
subscriptionConnect = multic.connect();

setTimeout(() => {
  sub2 = multic.subscribe({
    next: (v) => console.log(`observerB: ${v}`),
  });
}, 600);

setTimeout(() => {
  sub1.unsubscribe();
}, 1200);

// We should unsubscribe the shared Observable execution here,
// because `multicasted` would have no more subscribers after this
setTimeout(() => {
  sub2.unsubscribe();
  subscriptionConnect.unsubscribe(); // for the shared Observable execution
}, 2000);

// exmpl 4
const srce = interval(500);
const subje = new Subject();
const refCounted = srce.pipe(multicast(subje), refCount());
let su1, su2;

// This calls `connect()`, because
// it is the first subscriber to `refCounted`
console.log('observer A subscribed');
su1 = refCounted.subscribe({
  next: (v) => console.log(`observer A: ${v}`),
});

setTimeout(() => {
  console.log('observerB subscribed');
  su2 = refCounted.subscribe({
    next: (v) => console.log(`observerB: ${v}`),
  });
}, 600);

setTimeout(() => {
  console.log('observer A unsubscribed');
  su1.unsubscribe();
}, 1200);

// This is when the shared Observable execution will stop, because
// `refCounted` would have no more subscribers after this
setTimeout(() => {
  console.log('observerB unsubscribed');
  su2.unsubscribe();
}, 2000);
