
// 基础实例
const element = <h1 title="foo">Hello</h1>
const container = document.getElementById('root')
ReactDOM.render(element, container)


// 
const element = React.createElement('h1', { title: 'foo'}, "hello");


const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 'hello'
  }
}

// 自己替换第三步
const node = document.createElement(element.type);
node['title'] = element.props.title;
const text = document.createTextNode("")
text['nodeValue'] = element.props.children
node.appendChild(text);
container.appendChild(node)