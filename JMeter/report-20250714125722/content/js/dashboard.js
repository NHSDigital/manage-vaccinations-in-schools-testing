/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.9918280624336, "KoPercent": 0.008171937566396992};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6177473239244563, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9051565377532228, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8868421052631579, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.4891891891891892, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8743169398907104, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.1389413988657845, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.15804597701149425, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4473684210526316, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.868421052631579, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.41467889908256883, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.9736842105263158, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9571428571428572, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.15126050420168066, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0017857142857142857, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4185185185185185, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9473684210526315, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.7821948488241881, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8157894736842105, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.8157894736842105, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.4785714285714286, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.16085790884718498, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.8802281368821293, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9094269870609981, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.65, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.8157894736842105, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.8189219539584504, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.6578947368421053, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.46768402154398564, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 12237, 1, 0.008171937566396992, 827.1426820299075, 0, 15416, 439.0, 1911.6000000000022, 3697.7000000000025, 6735.580000000007, 3.3940981467674938, 82.28677580412209, 4.203442639807193], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 3, 0, 0.0, 10258.0, 3556, 20817, 6401.0, 20817.0, 20817.0, 20817.0, 0.0013928624158362885, 0.3136810493929905, 0.022344741398842436], "isController": true}, {"data": ["2.0 Register attendance", 554, 0, 0.0, 7675.514440433219, 3077, 24514, 6738.0, 12043.5, 14354.0, 18490.10000000005, 0.15749535758269076, 41.55231399574393, 0.6817956306196561], "isController": true}, {"data": ["2.5 Select patient", 543, 0, 0.0, 434.76795580110496, 168, 12463, 216.0, 603.6, 868.9999999999993, 4595.999999999992, 0.15512667964626545, 4.405950957525144, 0.10755853764535984], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 247.20000000000005, 221, 424, 236.0, 287.0, 313.30000000000007, 424.0, 0.07897949466662756, 1.1346592186417557, 0.11415005088536014], "isController": false}, {"data": ["2.5 Select menacwy", 380, 0, 0.0, 493.31578947368416, 169, 5785, 259.5, 674.4000000000009, 2207.349999999989, 4903.009999999999, 0.11546340630418045, 2.912213986412844, 0.08050866416131332], "isController": false}, {"data": ["2.3 Search by first/last name", 555, 0, 0.0, 996.336936936937, 435, 7865, 724.0, 1348.6000000000004, 2416.9999999999973, 6600.319999999992, 0.1581255146201996, 12.280214104261697, 0.13639772448837137], "isController": false}, {"data": ["2.5 Select td_ipv", 366, 0, 0.0, 565.4453551912572, 168, 7586, 265.0, 769.3, 2111.699999999998, 6455.399999999983, 0.11406392628603182, 2.9154791175752877, 0.0794214642987702], "isController": false}, {"data": ["4.0 Vaccination for flu", 529, 0, 0.0, 2594.4669187145564, 550, 13430, 1729.0, 5362.0, 7232.0, 9188.200000000019, 0.15430518765873527, 9.060615998651361, 0.9382753316103073], "isController": true}, {"data": ["4.0 Vaccination for hpv", 522, 0, 0.0, 2653.5363984674314, 600, 16054, 1698.0, 5859.499999999999, 7149.899999999996, 10656.789999999986, 0.15572922446846213, 8.074657654415818, 0.9441416360652773], "isController": true}, {"data": ["5.8 Consent confirm", 19, 0, 0.0, 1479.3684210526317, 683, 7122, 1082.0, 2917.0, 7122.0, 7122.0, 0.006787845184256057, 0.6545054819218247, 0.014970868868298298], "isController": false}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 89.39999999999998, 83, 110, 89.0, 92.9, 99.9, 110.0, 0.07901649299970312, 0.4761824006847344, 0.047610523614078935], "isController": false}, {"data": ["5.9 Patient home page", 19, 0, 0.0, 599.1578947368421, 181, 4473, 257.0, 2244.0, 4473.0, 4473.0, 0.006797186966286668, 0.17386558638795338, 0.0050720374371170775], "isController": false}, {"data": ["2.4 Patient attending session", 545, 0, 0.0, 1365.6018348623852, 600, 9234, 906.0, 2520.0, 4633.599999999996, 7250.279999999997, 0.15521847356159468, 10.531908298990654, 0.2307055827741671], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 273.0, 273, 273, 273.0, 273.0, 273.0, 273.0, 3.663003663003663, 22.972470238095237, 7.744534111721611], "isController": false}, {"data": ["5.4 Consent route", 19, 0, 0.0, 301.157894736842, 249, 542, 284.0, 377.0, 542.0, 542.0, 0.006789661989185141, 0.0813607820457752, 0.010784381396576295], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 285.3714285714285, 247, 718, 263.0, 332.6, 353.65000000000003, 718.0, 0.07890586868034444, 0.4072436679449417, 0.042766364372647615], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 454.41428571428577, 404, 1234, 433.5, 490.09999999999997, 545.5500000000001, 1234.0, 0.07908630462462815, 0.767461532280205, 0.12442191088894136], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 357, 0, 0.0, 2773.1876750700276, 702, 15962, 1744.0, 6243.199999999999, 8046.799999999995, 11452.820000000005, 0.1133475827437354, 6.419573463144097, 0.6877287564365235], "isController": true}, {"data": ["2.1 Open session", 560, 0, 0.0, 3898.992857142858, 1494, 15218, 3384.5, 6698.9000000000015, 7421.649999999998, 12579.249999999987, 0.15792077002167462, 2.807264754629194, 0.10307645963206717], "isController": false}, {"data": ["4.3 Vaccination confirm", 1755, 0, 0.0, 1308.9629629629649, 501, 15416, 837.0, 2478.600000000001, 4532.599999999998, 7467.680000000007, 0.5148516361867652, 10.897917285325937, 1.1982837215353785], "isController": false}, {"data": ["5.6 Consent questions", 19, 0, 0.0, 345.89473684210526, 252, 615, 279.0, 540.0, 615.0, 615.0, 0.006791283137887353, 0.08335413443041151, 0.01695482092190596], "isController": false}, {"data": ["4.1 Vaccination questions", 1786, 0, 0.0, 697.6382978723412, 241, 12443, 431.0, 891.2999999999995, 2667.999999999992, 5870.129999999988, 0.5164503609080042, 6.725187511458199, 1.1153068009008675], "isController": false}, {"data": ["5.3 Consent parent details", 19, 0, 0.0, 808.9473684210525, 245, 4429, 277.0, 2834.0, 4429.0, 4429.0, 0.006790945739271288, 0.07676428379380115, 0.012525692783690865], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 19, 0, 0.0, 442.7368421052632, 255, 1143, 363.0, 742.0, 1143.0, 1143.0, 0.006783269885958953, 0.14016991287782368, 0.010780852765913998], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1234.9714285714292, 1128, 2029, 1191.0, 1390.3, 1493.8500000000001, 2029.0, 0.07881516043388871, 3.6419377298306377, 0.37521865929219483], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 373, 0, 0.0, 2615.852546916892, 517, 15296, 1668.0, 5883.6, 7334.900000000001, 13166.099999999997, 0.11483604768189738, 6.123327257490435, 0.6979135903574972], "isController": true}, {"data": ["5.0 Consent for td_ipv", 3, 0, 0.0, 3886.3333333333335, 3188, 4893, 3578.0, 4893.0, 4893.0, 4893.0, 0.0013992850586207154, 0.3156030057167791, 0.02244367600697217], "isController": true}, {"data": ["Calculate site depending on vaccination", 1809, 0, 0.0, 0.21282476506357162, 0, 15, 0.0, 1.0, 1.0, 1.0, 0.5175203081663217, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 526, 0, 0.0, 519.0285171102662, 171, 7337, 297.5, 665.5, 1626.4499999999985, 6029.710000000012, 0.15543050852666357, 3.7159522046753852, 0.11581394336508233], "isController": false}, {"data": ["2.5 Select flu", 541, 0, 0.0, 437.9426987060997, 165, 12711, 231.0, 584.8000000000002, 825.8, 4836.740000000035, 0.155051512354109, 3.7110731320090236, 0.1075064196986498], "isController": false}, {"data": ["5.1 Consent start", 20, 1, 5.0, 749.6499999999999, 260, 5630, 518.5, 871.4000000000003, 5392.949999999996, 5630.0, 0.007132375098738817, 0.0868411942136824, 0.01490415648074348], "isController": false}, {"data": ["5.5 Consent agree", 19, 0, 0.0, 696.6315789473684, 240, 4475, 296.0, 1794.0, 4475.0, 4475.0, 0.006782630611154286, 0.11396185992939638, 0.01064736349331179], "isController": false}, {"data": ["1.5 Open Sessions list", 79, 0, 0.0, 160.1898734177215, 138, 279, 149.0, 208.0, 241.0, 279.0, 0.02420718407939466, 0.2650799768783089, 0.014610311544160951], "isController": false}, {"data": ["4.2 Vaccination batch", 1781, 0, 0.0, 663.4368332397522, 247, 13114, 329.0, 922.5999999999999, 2892.1999999999975, 5786.580000000005, 0.516083790448538, 10.980612062589287, 0.835570349921327], "isController": false}, {"data": ["5.0 Consent for hpv", 6, 0, 0.0, 8845.833333333334, 3634, 14155, 8227.0, 14155.0, 14155.0, 14155.0, 0.0027556433278985923, 0.6115128661274026, 0.04416743690724964], "isController": true}, {"data": ["5.7 Consent triage", 19, 0, 0.0, 1411.8947368421052, 260, 11452, 505.0, 6571.0, 11452.0, 11452.0, 0.0067903778201957995, 0.11075966190351444, 0.011427351489969718], "isController": false}, {"data": ["5.0 Consent for flu", 8, 1, 12.5, 4389.5, 261, 8745, 4136.5, 8745.0, 8745.0, 8745.0, 0.00284796326127393, 0.5607793323528626, 0.03920190835788218], "isController": true}, {"data": ["Log name and address", 1, 0, 0.0, 88.0, 88, 88, 88.0, 88.0, 88.0, 88.0, 11.363636363636363, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 557, 0, 0.0, 999.096947935368, 419, 8502, 795.0, 1370.6, 1902.2, 6080.679999999991, 0.15760481427531778, 11.560078032951857, 0.10424993884678549], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.008171937566396992], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 12237, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["5.1 Consent start", 20, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
