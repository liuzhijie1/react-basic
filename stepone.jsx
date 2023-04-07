const element = (
  <div id='foo'>
    <a>bar</a>
    <b />
  </div>
)

const container = document.getElementById('root')
Didact.render(element, container);


function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => 
        typeof child === 'object'
        ? child
        : createTextElement(child)
        )
    }
  }
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

// function render(element, container) {
//   // TODO create dom nodes
//   const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type);

//   const isProperty = key => key !== 'children'
//   Object.keys(element.props)
//     .filter(isProperty)
//     .forEach(name => {
//       dom[name] = element.props[name]
//     })

//   element.props.children.forEach(child => render(child, dom))

//   container.appendChild(dom);
// }

function createDom (fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  const isProperty = key => key !== 'children'

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom;
}

function commitRoot() {
  // TODO add nodes to dom
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element, container) {
  // TODO set next unit of work
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot,
  }
  nextUnitOfWork = wipRoot;
}


let nextUnitOfWork = null;
let wipRoot = null;

function workLoop (deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
  // TODO 
  // TODO add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // TODO create new fibers
  const elements = fiber.props.children
  reconcileChildren(fiber, elements);
  
  // TODO return next unit of work

  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent
  }
}

const Didact = {
  createElement,
  render
}

/** @jsx Didact.createElement */
const element = Didact.createElement(
  "div",
  {id: 'foo'},
  Didact.createElement('a', null, 'bar'),
  Didact.createElement('b')
)