# createElement Function
jsx --> js 

# render function
虚拟节点 --> 真实dom节点

# concurrent mode
react16之前，由于是递归渲染，当渲染节点又多又深的时候，将会导致浏览器渲染被阻塞，用户只能等待渲染完成之后进行交互，因此引入并发模式。

将任务拆成多个小的执行任务，让浏览器有高优执行的任务时候，中断render

# fiber
为了能够组织小任务，因此引入fiber数据结构来维护关系。
单元任务 === fiber

render的时候会递归渲染，这个时候可以建立关系

# render and commit 
commit阶段：由于render阶段的渲染会被浏览器中止，因此ui渲染可能是不完整的，因此需要一个阶段将完整的dom渲染出来

commit触发时机：整个fiber树遍历完成

# reconciliation
处理dom的render、update、delete

# function component
函数组件是直接执行，来拿到react element
在fiber节点上的type就是直接对应具体的函数，vue的组件也是一样的

# hooks
通过fiber节点维护一个hooks链表，通过下标去标注当前运行的state，setState触发更新，将工作树重新执行一遍

# 后续待完善，阅读react 源码，分析面试题