// 多个小任务单元
let nextUnitOfWork = null

let wipRoot = null
let currentRoot = null

let deletions = null

const isEvent = key => key.startsWith("on")
const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => key => {
    prev[key] !== next[key]
}
const isGone = (prev, next) => key => !(key in next)

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
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

function createDom(fiber) {
    const dom = fiber.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type)

    const isProperty = key => key !== 'children'

    Object.keys(fiber.props).filter(isProperty).forEach(name => {
        dom[name] = fiber.props[name]
    }) 

    return dom
}

function updateDom(dom, prevProps, nextProps) {
    Object.keys(prevProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps,nextProps)(key)).forEach(name => {
        const eventType = name.toLowerCase().substring(2)
        document.removeEventListener(eventType,prevProps[name])
    })
    
    Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => {
        dom[name] = ''
    })

    Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => {
        dom[name] = nextProps[name]
    })

    Object.keys(nextProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps,nextProps)(key)).forEach(name => {
        const eventType = name.toLowerCase().substring(2)
        document.addEventListener(eventType,prevProps[name])
    })
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot,
    }
    deletions = []

    nextUnitOfWork = wipRoot
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    if(!fiber) return 

    const domParent = fiber.parent.dom
    if(fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    }
    else if (fiber.effectTag === 'DELETION') {
        domParent.removeChildren(fiber.dom)
    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function workLoop(deadline) {
    let shouldYield = false // 下一次执行

    while(nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }

    // fiber树遍历完成 
    if(!nextUnitOfWork && wipRoot) {
        commitRoot()
    } 

    /**
     * 这里react是实现scheduler
     */
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function reconcileChildren(wipFiber, elements) {
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null

    while(index < elements.length || oldFiber != null) {
        const element = elements[index]
        let newFiber = null

        const sameType = oldFiber && element && element.type == oldFiber.type

        // update
        if(sameType) {
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }
        }
        // add
        if(element && !sameType) { 
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: 'PLACEMENT'
            }
        }
        // delete
        if(oldFiber && !sameType) {
            oldFiber.effectTag = 'DELETION'
            deletions.push(oldFiber)
        }

        if(index === 0) {
            wipFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index ++
    }
}

function performUnitOfWork(fiber) {
    if(!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    const elements = fiber.props.children
    reconcileChildren(fiber, elements)

    if(fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if(nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

const element = createElement(
    "div",
    { id: "foo"},
    createElement("a", null, "bar"),
    createElement("b", null, "bar")
)
const container = document.getElementById('root')

render(element, container)