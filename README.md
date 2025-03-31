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

# hooks