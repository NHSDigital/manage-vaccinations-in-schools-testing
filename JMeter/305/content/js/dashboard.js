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

    var data = {"OkPercent": 99.99533603843105, "KoPercent": 0.004663961568956672};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8595824713184126, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.5147058823529411, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9932153392330384, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7037037037037037, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9900176159718145, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.49527186761229314, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.42592592592592593, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9896966227819118, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.919889502762431, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9897084048027445, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9845183486238532, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4976190476190476, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9587719298245614, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5370370370370371, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.8005447941888619, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9943317422434368, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.48509174311926606, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4988038277511962, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.625, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7297139521307647, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9934249850567842, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9870892018779343, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21441, 1, 0.004663961568956672, 215.29513548808444, 0, 19189, 115.0, 498.0, 600.0, 917.9800000000032, 5.7704201175883565, 2411.681196510798, 43.80076121031474], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 122.03703703703704, 79, 435, 99.0, 209.39999999999986, 410.9999999999999, 435.0, 0.007837197603907452, 3.554897614451386, 0.058258259662466415], "isController": false}, {"data": ["2.0 Register attendance", 1700, 1, 0.058823529411764705, 861.3776470588239, 351, 3866, 805.0, 1245.8000000000002, 1459.8999999999996, 2210.8900000000003, 0.47612379218596834, 956.3399526064277, 15.639614112169165], "isController": true}, {"data": ["2.5 Select patient", 1695, 0, 0.0, 117.12271386430668, 57, 1178, 100.0, 168.4000000000001, 271.1999999999998, 526.04, 0.4768862115737329, 214.15127395306948, 3.439334635943097], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 746.3333333333331, 377, 3070, 501.0, 1696.3999999999992, 2868.3999999999987, 3070.0, 0.007832470987947277, 3.6063415469906195, 0.05781008362830806], "isController": false}, {"data": ["2.3 Search by first/last name", 1703, 0, 0.0, 129.5924838520261, 65, 3303, 101.0, 177.8000000000004, 320.5999999999999, 653.7600000000011, 0.4767730610622269, 215.7179398418712, 3.565504754694941], "isController": false}, {"data": ["4.0 Vaccination for flu", 412, 0, 0.0, 750.8179611650484, 190, 2517, 708.0, 1026.8, 1213.9999999999993, 1648.8700000000003, 0.11787179611154677, 155.11377772034587, 3.345191951412645], "isController": true}, {"data": ["4.0 Vaccination for hpv", 423, 0, 0.0, 775.7399527186757, 189, 2266, 726.0, 1006.6, 1223.3999999999996, 1844.0399999999993, 0.1223715077471579, 161.14350170002015, 3.4821379930588163], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 2478.8888888888896, 347, 19189, 992.0, 6524.199999999994, 16660.999999999985, 19189.0, 0.007843504082543876, 4.3545345707344625, 0.05784612630031499], "isController": false}, {"data": ["1.2 Sign-in page", 1747, 0, 0.0, 134.02060675443573, 14, 7329, 96.0, 189.20000000000005, 291.0, 745.2399999999998, 0.48579163737642483, 216.9376364159992, 4.124279020349859], "isController": false}, {"data": ["2.4 Patient attending session", 724, 1, 0.13812154696132597, 412.7872928176798, 254, 1537, 378.0, 557.0, 675.5, 1018.75, 0.20320069155594472, 92.34428890765244, 1.7832690481352689], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 14.204545454545455, 26.811079545454547], "isController": false}, {"data": ["1.1 Homepage", 1749, 0, 0.0, 136.4505431675244, 26, 5742, 102.0, 181.0, 291.5, 662.0, 0.4860808294890148, 216.902787216901, 4.1181591123341414], "isController": false}, {"data": ["1.3 Sign-in", 1744, 0, 0.0, 153.72534403669746, 60, 5941, 104.0, 288.0, 385.5, 707.4499999999991, 0.4856264051561049, 217.072124462198, 4.286012189598685], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 7838.481481481481, 4075, 32762, 4838.0, 16553.799999999996, 28193.599999999977, 32762.0, 0.007819502708588855, 31.612200960586083, 0.4634452502675283], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 420, 0, 0.0, 771.9857142857144, 191, 2470, 723.5, 1010.7, 1131.4499999999998, 1678.7400000000002, 0.12152429661303105, 160.62468649172808, 3.455732182169116], "isController": true}, {"data": ["2.1 Open session", 1710, 0, 0.0, 294.8614035087721, 107, 2237, 254.0, 467.0, 587.3499999999995, 914.6699999999996, 0.4773893336147418, 213.31444843900317, 3.4461438920198373], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1261.0370370370367, 303, 5477, 570.0, 3544.9999999999995, 4864.199999999997, 5477.0, 0.00788609672385255, 4.377323911309744, 0.05815112114373521], "isController": false}, {"data": ["4.3 Vaccination confirm", 1652, 0, 0.0, 506.0914043583531, 302, 2020, 473.0, 708.0, 831.6999999999998, 1364.8200000000002, 0.4775554710165456, 213.20922331985824, 4.922484670509128], "isController": false}, {"data": ["4.1 Vaccination questions", 1676, 0, 0.0, 135.19749403341285, 77, 1411, 112.0, 179.0, 269.14999999999986, 517.9200000000001, 0.4771031752696586, 208.72686048043164, 4.4737210130820495], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 956.6296296296297, 374, 3053, 734.0, 1837.3999999999994, 2797.799999999999, 3053.0, 0.007883777929743275, 4.379193412504956, 0.058147424603343774], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1744, 0, 0.0, 930.2230504587151, 271, 19012, 853.0, 1207.5, 1366.0, 1928.3999999999978, 0.4855247369842344, 891.7787590626992, 15.959088888140696], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 418, 0, 0.0, 766.1363636363636, 198, 2510, 717.0, 1046.4, 1172.7999999999993, 1680.3500000000001, 0.11991009611453995, 158.14057022647373, 3.4070153053906473], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1116.714285714286, 285, 5445, 508.5, 3578.2000000000016, 5006.699999999997, 5445.0, 0.007827195647184683, 4.304158015548025, 0.05645042731246808], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.6542514534883725, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2024.9259259259265, 1614, 4214, 1771.0, 3553.7999999999997, 4143.2, 4214.0, 0.007834252745760509, 4.354354352482327, 0.058427634826038966], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 124.85185185185182, 79, 760, 101.0, 132.0, 508.79999999999865, 760.0, 0.007837281775243014, 3.5549360774426484, 0.05839665007364142], "isController": false}, {"data": ["Debug Sampler", 1703, 0, 0.0, 0.3305930710510867, 0, 23, 0.0, 1.0, 1.0, 1.0, 0.47680322893498456, 2.6996797694461803, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1713, 0, 0.0, 514.9883245767653, 305, 2672, 512.0, 747.4000000000005, 826.3, 1073.4399999999996, 0.47763614442512464, 241.6543997894867, 3.4443342699646613], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1673, 0, 0.0, 131.25941422594155, 72, 945, 108.0, 183.8000000000004, 266.5999999999999, 548.04, 0.4781510957462558, 210.38882354904507, 4.239474997760007], "isController": false}, {"data": ["2.2 Session register", 1704, 0, 0.0, 143.7664319248828, 63, 3389, 99.5, 299.5, 360.0, 681.8000000000002, 0.4763567431176375, 220.3674645797906, 3.4428648555617305], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 123.77777777777776, 78, 518, 106.0, 172.79999999999993, 408.3999999999994, 518.0, 0.007838954202216567, 3.5556946785948935, 0.058164144235160496], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.004663961568956672], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21441, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 724, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
