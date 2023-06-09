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

function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(fiber.type)

  const isProperty = key => key !== 'children'

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      dom[name] = fiber.props[name]
    })

  return dom;
}

const isEvent = key => key.startsWith('on')
const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
function updateDom(dom, prevProps, nextProps) {
  // TODO
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ''
    })

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name]
    })

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })

}

function commitRoot() {
  // TODO add nodes to dom
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  // const domParent = fiber.parent.dom
  let domParentFiber = fiber.parent
  while(!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    // domParent.removeChild(fiber.dom)
    commitDeletion(fiber, domParent)
  }


  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
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
  deletions = [];
  nextUnitOfWork = wipRoot;
}


let nextUnitOfWork = null;
let cyrrentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
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

  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // TODO add dom node
  // if (!fiber.dom) {
  //   fiber.dom = createDom(fiber)
  // }
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }
  // TODO create new fibers
  // const elements = fiber.props.children
  // reconcileChildren(fiber, elements);

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

function updateFunctionComponent(fiber) {
  // TODO
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props.children)
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null;

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index];
    let newFiber = null;

    // TODO compare oldFiber to element

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      // TODO update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      }
    }
    if (element && !sameType) {
      // TODO add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "RLACEMENT"
      }
    }
    if (oldFiber && !sameType) {
      // TODO delete the oldFiber's node
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // const newFiber = {
    //   type: element.type,
    //   props: element.props,
    //   parent: wipFiber,
    //   dom: null
    // }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber
    index++
  }
}

const Didact = {
  createElement,
  render
}

/** @jsx Didact.createElement */
// const element = Didact.createElement(
//   "div",
//   { id: 'foo' },
//   Didact.createElement('a', null, 'bar'),
//   Didact.createElement('b')
// )
/** @jsx Didact.createElement */
function App(props) {
  return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
const container = document.getElementById('root')
Didact.render(element, container)
/**
 * it will transform the jsx to js
 * function App(props) {
 *  return Didact.createElement('h1', null, 'hi ', props.name) 
 * }
 * 
 * const element = Didact.createElement(App, {name: 'foo'})
 */