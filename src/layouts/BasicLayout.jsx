/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter } from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import {Link, Route} from 'umi';
import { connect } from 'dva';
import {Icon, Result, Button, Tabs, Menu, Dropdown} from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { isAntDesignPro, getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
import defaultSettings from "../../config/defaultSettings";
const { hideAntTabs } = defaultSettings;
const { TabPane } = Tabs;
const noMatch = (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = menuList =>
  menuList.map(item => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <DefaultFooter
    copyright="2019 蚂蚁金服体验技术部出品"
    links={[
      {
        key: 'Ant Design Pro',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <Icon type="github" />,
        href: 'https://github.com/ant-design/ant-design-pro',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: 'Ant Design',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);

const footerRender = () => {
  if (!isAntDesignPro()) {
    return defaultFooterDom;
  }

  return (
    <>
      {defaultFooterDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};

const BasicLayout = props => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;
  /**
   * constructor
   */
  const updateTree = data => {
    console.log("data",data);
    const treeData = data;
    const treeList = [];
    // 递归获取树列表
    const getTreeList = data => {
      data.forEach(node => {
        if(!node.routes&&node.name){
          treeList.push({ tab: node.name, key: node.path,locale:node.locale,closable:true,content:node.component });
        }
        if (node.routes && node.routes.length > 0) { //!node.hideChildrenInMenu &&
          getTreeList(node.routes);
        }
      });
    };
    getTreeList(treeData);
    return treeList;
  };

  const routers = props.route.routes;
  const routeKey="/welcome";
  let activeKey="/welcome";
  const tabName="首页";
  console.log("props",props,props.route.routes);
  const tabLists  = updateTree(routers);
  let tabList=[],tabListArr=[];
  tabLists.map(v => {
    if(v.key===routeKey){
      if(tabList.length===0){
        v.closable=false;
        v.tab=tabName;
        tabList.push(v);
      }
    }
    if(v.key){
      tabListArr.push(v.key);
    }
  });
  console.log("tabLists",tabLists);
  const onClickHover=(e)=> {
    // message.info(`Click on item ${key}`);
    let {key} = e, {activeKey, tabList, tabListKey, routeKey} = this.state;

    if (key === '1') {
      tabList = tabList.filter((v) => v.key !== activeKey || v.key === routeKey)
      tabListKey = tabListKey.filter((v) => v !== activeKey || v === routeKey)
      this.setState({
        activeKey: routeKey,
        tabList,
        tabListKey
      })
    } else if (key === '2') {
      tabList = tabList.filter((v) => v.key === activeKey || v.key === routeKey)
      tabListKey = tabListKey.filter((v) => v === activeKey || v === routeKey)
      this.setState({
        activeKey,
        tabList,
        tabListKey
      })
    } else if (key === '3') {
      tabList = tabList.filter((v) => v.key === routeKey)
      tabListKey = tabListKey.filter((v) => v === routeKey)
      this.setState({
        activeKey: routeKey,
        tabList,
        tabListKey
      })
    }
  }
  const menu = (
    <Menu onClick={onClickHover}>
      <Menu.Item key="1">关闭当前标签页</Menu.Item>
      <Menu.Item key="2">关闭其他标签页</Menu.Item>
      <Menu.Item key="3">关闭全部标签页</Menu.Item>
    </Menu>
  );
  const operations = (
    <Dropdown overlay={menu} >
      <a className="ant-dropdown-link" href="#">
        更多<Icon type="down" />
      </a>
    </Dropdown>
  );
  const onChange = key => {
    activeKey=key;
    router.push(key)
  };
  const onEdit = (targetKey, action) => {
    this[action](targetKey);
  }
  const remove = (targetKey) => {
    let lastIndex;
    tabList.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const tabList = [],tabListKey=[]
    tabList.map(pane => {
      if(pane.key !== targetKey){
        tabList.push(pane)
        tabListKey.push(pane.key)
      }
    });
    if (lastIndex >= 0 && activeKey === targetKey) {
      activeKey = tabList[lastIndex].key;
    }
    router.push(activeKey)
  }
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = payload => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
/*  const onMenuHeaderClick = e =>{
    console.log("点击")
  }*/
  const onHandlePage =(e)=>{//点击左侧菜单
    let {key,search=''} = e;

    if(tabListArr.includes(key)){
      if(!search){
        router.push(key)
      }else{
        router.push({pathname:key,search})
      }

    }else{
      key = '/exception/404'
      router.push('/exception/404')
    }

    this.setState({
      activeKey:key
    })
    tabLists.map((v) => {
      if(v.key === key){
        if(tabList.length === 0){
          v.closable = false
          this.setState({
            tabList:[...tabList,v]
          })
        }else{
          if(!tabListKey.includes(v.key)){
            this.setState({
              tabList:[...tabList,v],
              tabListKey:[...tabListKey,v.key]
            })
          }
        }
      }
    })
    // this.setState({
    //   tabListKey:this.state.tabList.map((va)=>va.key)
    // })
  }
  return (
    <ProLayout
      logo={logo}
      menuHeaderRender={(logoDom, titleDom) => (
        <Link to="/">
          {logoDom}
          {titleDom}
        </Link>
      )}
      /*onMenuHeaderClick={onMenuHeaderClick}*/
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }

        onHandlePage();
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;

      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
            defaultMessage: 'Home',
          }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      menuDataRender={menuDataRender}
      formatMessage={formatMessage}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
    >
      {/*<Authorized authority={authorized.authority} noMatch={noMatch}>
        {children}
      </Authorized>*/}

      {/*hideAntTabs ?
      (<Authorized authority={authorized.authority} noMatch={noMatch}>
      {children}
    </Authorized>) :
      (tabList && tabList.length ? (
      <Tabs
        // className={styles.tabs}
        activeKey={activeKey}
        onChange={onChange}
        tabBarExtraContent={operations}
        tabBarStyle={{background:'#fff'}}
        tabPosition="top"
        tabBarGutter={-1}
        hideAdd
        type="editable-card"
        onEdit={onEdit}
      >
        {tabList.map(item => (
          <TabPane tab={item.tab} key={item.key} closable={item.closable}>
            <Authorized authority={authorized.authority} noMatch={noMatch}>
              {item.content}
              <Route key={item.key} path={item.path} component={item.content} exact={item.exact} />
            </Authorized>
          </TabPane>
        ))}
      </Tabs>
      ) : null)*/}
      <Tabs
        // className={styles.tabs}
        activeKey={activeKey}
        onChange={onChange}
        tabBarExtraContent={operations}
        tabBarStyle={{background:'#fff'}}
        tabPosition="top"
        tabBarGutter={-1}
        hideAdd
        type="editable-card"
        onEdit={onEdit}
      >
        {tabList.map(item => (
          <TabPane tab={item.tab} key={item.key} closable={item.closable}>
            <Authorized authority={authorized.authority} noMatch={noMatch}>
              {/*{item.content}*/}
              <Route key={item.key} path={item.path} component={item.content} exact={item.exact} />
            </Authorized>
          </TabPane>
        ))}
      </Tabs>
    </ProLayout>
  );
};

export default connect(({ global, settings }) => ({
  collapsed: global.collapsed,
  settings,
}))(BasicLayout);
