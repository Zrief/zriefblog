## 一、安装
略
## 二、WPS前处理
WPS 是 WRF 模型的前处理系统，用于准备模拟所需的地形、大气初始/边界数据。它的主要功能是将原始气象数据（如 ERA5、GFS）处理成 WRF 模型可以使用的格式。
### WPS ungrib
#### 数据准备
```bash
cd ~/Build_WRF/WPS

# 检查GRIB数据格式
./util/g1print.exe /home/ouc/stu/Build_WRF/DATA/20210719/ERA5_level.grib >& g1print.log

vim g1print.log

# 链接气象数据
ln -sf ungrib/Variable_Tables/Vtable.GFS Vtable 
# 如果是ERA5数据，这里改成Vtable.ECMWF，例如
ln -sf ungrib/Variable_Tables/Vtable.ECMWF Vtable

./link_grib.csh /home/ouc/stu/Build_WRF/DATA/matthew/fnl#链接 GRIB 数据文件至当前目录供 WPS 使用：


```
#### namelist.wps 配置要点 
```fortran
[share]
max_dom = 1
start_date = '2016-10-06_00:00:00'
end_date = '2016-10-08_00:00:00'
interval_seconds = 21600

[ungrib]
prefix = 'FILE' !中间文件的前缀字符串
```
#### 运行ungrib
`./ungrib.exe`
成功会显示Successful
### WPS geogrid
#### 配置namelist.wps
```fortran
&geogrid
 parent_id = 1,   !每个网格的上级网格编号，初始为1
 parent_grid_ratio = 1,!子网格与父网格之间的分辨率比例
 i_parent_start = 1,!当前网格在父网格中的起始列索引
 j_parent_start = 1,!当前网格在父网格中的起始行索引
 e_we = 91,!东西向网格点数量
 e_sn = 100,!南北向网格点数量
 geog_data_res = "default",!地理数据分辨率，默认会根据区域进行匹配
 dx = 27000,!东西向网格的长度（米）
 dy = 27000,
 map_proj = ‘mercator’,!地图投影方式
 ref_lat = 28.00,!网格中心点的纬度
 ref_lon = -75.00,
 truelat1 = 30.0,!投影第一标准纬线，用于投影变换
 truelat2 = 60.0,!投影第二标准纬线，用于投影变换
 stand_lon = -75.0,!投影中心的经线
!地理数据的路径，已下载高分辨率数据在该路径下
 geog_data_path = '/home/ouc/stu/Build_WRF/WPS_GEOG/' 
 /
```
#### 运行geogrid
`./geogrid.exe`
成功则生成`geo_em*.nc`
### WPS metgrid
完成 ungrib 和 geogrid 之后，可以执行`./metgrid.exe`生成最终要输入WRF的nc文件

## 三、运行WRF

### 初始化
```bash
cd ~/Build_WRF/WRF/test/em_real

# 链接前处理文件
ln -sf ../../../WPS/met_em.d01.2016-10* .
```

### namelist.input参数
#### 时间控制
```fortran
 &time_control
 run_days = 0,!设置这次模拟的持续时间，持续时间为这里的四个量的总和
 run_hours = 48,
 run_minutes = 0,
 run_seconds = 0,
 start_year = 2016,!模拟的开始时间
 start_month = 10,
 start_day = 06,
 start_hour = 00,
 end_year = 2016,! 结束时间
 end_month = 10,
 end_day = 08,
 end_hour = 00,
 interval_seconds = 21600,!气象输入场的时间间隔（单位：秒）
 input_from_file = .true.,!是否每个时间点都从 met_em 文件中读取输入
 history_interval = 180,!控制输出文件（wrfout）的时间间隔 （单位：分）
 frames_per_outfile = 1,!每个输出文件中包含的时间帧数，即每个时间包含多少个输出间隔。
 restart = .false.,!是否启用重启动功能（设为 .true. 则模拟可从中断处继续）
 restart_interval = 1440,!输出 restart 文件的间隔（单位：分）
 io_form_history                     = 2
 io_form_restart                     = 2
 io_form_input                       = 2
 io_form_boundary                    = 2
/
```
#### 区域
```fortran
 &domains
 time_step                           = 150,!设置积分的时间步长为 150 秒
 time_step_fract_num                 = 0,
 time_step_fract_den                 = 1,
 max_dom                             = 1,!只有一个区域，无嵌套
 e_we                                = 91, !东西向91格点
 e_sn                                = 100, !南北向100格点
 e_vert                              = 45,!模拟中大气垂直层数，垂向45层
 dzstretch_s                         = 1.1,!垂直层厚度随高度递增的拉伸因子，>1 表示上层比下层厚
 p_top_requested                     = 5000,!大气顶设定为 5000 Pa，即 50 hPa（对应高空模拟范围）
 num_metgrid_levels                  = 32,!使用的气象场垂直层数为 32 层
 num_metgrid_soil_levels             = 4,!使用的土壤场垂直层数为 4 层
 dx                                  = 27000,!东西向网格的长度（米）
 dy                                  = 27000,!南北向网格的长度（米）
 grid_id                             = 1, !本区域的 ID，主区域始终为 1
 parent_id                           = 1, !主区域无父域填1，嵌套区域时填父域的 ID
 i_parent_start                      = 1,!嵌套区域相对于父域的起始网格索引（主域设为 1）
 j_parent_start                      = 1,!嵌套区域相对于父域的起始网格索引（主域设为 1）
 parent_grid_ratio                   = 1,!嵌套区域与父域的空间分辨率比，主域为 1
 parent_time_step_ratio              = 1,!嵌套区域时间步长与父域的比例，主域为 1
 feedback                            = 1,!允许嵌套区域将模拟结果反馈到父域（主域无效）
 smooth_option                       = 0!关闭嵌套区域边界的平滑处理（常用默认值 0）
 /
```
#### 物理参数化方案/动力框架
具体含义在官网查，这里不再赘述
https://www2.mmm.ucar.edu/wrf/users/physics/phys_references.html
https://www2.mmm.ucar.edu/wrf/users/physics/wrf_physics_suites.php
```fortran
 &physics
 physics_suite                       = 'CONUS'
 mp_physics                          = -1,    -1,
 cu_physics                          = -1,    -1,
 ra_lw_physics                       = -1,    -1,
 ra_sw_physics                       = -1,    -1,
 bl_pbl_physics                      = -1,    -1,
 sf_sfclay_physics                   = -1,    -1,
 sf_surface_physics                  = -1,    -1,
 radt                                = 15,    15,
 bldt                                = 0,     0,
 cudt                                = 0,     0,
 icloud                              = 1,
 num_land_cat                        = 21,
 sf_urban_physics                    = 0,     0,
 fractional_seaice                   = 1,
 /


 &dynamics
 hybrid_opt                          = 2,
 w_damping                           = 0,!垂直速度阻尼开关。0适用于无强对流的情况。
 diff_opt                            = 2,      2,
 km_opt                              = 4,      4,
 diff_6th_opt                        = 0,      0,
 diff_6th_factor                     = 0.12,   0.12,
 base_temp                           = 290.
 damp_opt                            = 3,
 zdamp                               = 5000.,  5000.,
 dampcoef                            = 0.2,    0.2,
 khdif                               = 0,      0,
 kvdif                               = 0,      0,
 non_hydrostatic                     = .true., .true.,
 moist_adv_opt                       = 1,      1,
 scalar_adv_opt                      = 1,      1,
 gwd_opt                             = 1,      0,
 /
```

### 执行流程
```bash
# 生成初始场和边界条件
./real.exe  # 输出 wrfinput_d01 初始场和 wrfbdy_d01 边界条件

# 如果出现环境变量相关的报错，执行以下操作： 
cp /home/ouc/stu/WRF_env.bash ~/ 
chmod +x ~/WRF_env.bash
bash ~/WRF_env.bash
# 如果出现数据方面的错误，可以考虑先使用
ulimit -s unlimited
```

有了wrfbdy和wrfinput之后，就可以运行 wrf 了。

推荐使用 screen 工具来运行 wrf，这样即使关闭终端或断网，模拟任务也能继续在后台执行，不受影响。

```bash

# 启动并行计算（使用 screen 保持会话）
screen -S wrf_run #创建一个名为 wrf_run 的 screen 会话
ulimit -s unlimited #在新窗口中先解除堆栈限制
mpirun -np 4 ./wrf.exe  #再用两个核并行运行wrf（由于服务器公用，我们最多用四个核运行，以免过多占用）

# Ctrl+A+D，将任务挂起（detach）

# 监控任务
screen -ls
screen -r wrf_run
```
### 输出文件
```bash
ls -l wrfout*

# 得到
wrfout_d01_2016-10-06_00:00:00
wrfout_d01_2016-10-06_03:00:00
...
wrfout_d01_2016-10-08_00:00:00
```

## 四、嵌套网格配置

### 4.1 WPS 设置要点

```fortran
&geogrid
max_dom = 2
parent_grid_ratio = 1,3  ! 分辨率比例 1:3
i_parent_start = 1,31    ! 嵌套起始坐标
j_parent_start = 1,17
e_we = 305,295           ! 网格点数
e_sn = 232,220
```
### 4.2 WRF 设置要点

```fortran
[domains]
max_dom = 2
grid_id = 1,2
parent_id = 1,1
parent_time_step_ratio = 1,3
feedback = 1             ! 启用双向嵌套

[dynamics]
w_damping = 1            ! 强对流场景推荐
```