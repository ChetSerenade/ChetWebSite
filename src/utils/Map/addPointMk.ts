/*
 * @Description: 渲染蓝色坐标
 * @Author: Chetxu
 * @Date: 2022-07-09
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2022-09-06 21:52:50
 */

import { Popups } from './Popups'
import { Ref } from 'vue'

export function addPointMk(map: Ref, popup: mapboxgl.Popup, geoData: any) {
	map.value.on('load', () => {
		map.value.addSource('placers', {
			type: 'geojson',
			data: geoData,
		})

		// 添加一个显示位置的图层。
		map.value.addLayer({
			id: 'placers',
			type: 'circle',
			source: 'placers',
			paint: {
				//多个点渲染不同的颜色
				'circle-color': ['get', 'color'],
				//多个点渲染不同的大小
				'circle-radius': 7,
				'circle-stroke-opacity': 0,
				'circle-blur': 0,
				'circle-opacity': 0.6,
				'circle-stroke-width': 2,
				'circle-stroke-color': '#fff', //边框颜色
			},
		})
		Popups(map, popup)
	})
}
