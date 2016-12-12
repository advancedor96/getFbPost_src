/*global FB*/
import React, { Component } from 'react';
import {observer} from 'mobx-react';
import AppStore from './AppStore.js'
import _ from 'lodash'






class Posts extends Component {
	// constructor(){
 //    super()

	// }


  render() {
    if(_.isEmpty(AppStore.filter_post_list)){
      return null;
    }else{
      return (<div>
        {
          _.map(AppStore.filter_post_list, (post, key)=>{
            return(
                <div key={key}>
                <p style={{fontSize:'larger', color:'red'}}>計數：{key} </p>
                <p style={{fontSize:'larger'}} >{post.message} </p>
                時間:{post.created_time}
                ID:{post.id} {'   '}
                story:{post.story}
                <hr />

                </div>
            );
          })
        }



        </div>)


    }

  }
}

export default observer(Posts);


