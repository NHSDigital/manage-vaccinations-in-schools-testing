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

    var data = {"OkPercent": 99.96724533245988, "KoPercent": 0.03275466754012447};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.824527304977922, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.46487603305785125, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9893491124260355, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5555555555555556, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9920494699646644, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.48048780487804876, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4825174825174825, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3888888888888889, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9813325674899483, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8354166666666667, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.983926521239954, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9792865362485615, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4855421686746988, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9276084407971864, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.3888888888888889, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.6499391727493917, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9871257485029941, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4074074074074074, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.46490218642117376, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4854721549636804, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5178571428571429, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.522567409144197, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9895083932853717, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9856051703877791, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21371, 7, 0.03275466754012447, 256.1298488606064, 0, 8915, 128.0, 596.0, 725.0, 1113.9800000000032, 5.688166771268676, 2375.8871494493555, 43.197209498943735], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 111.22222222222221, 87, 174, 104.0, 145.6, 166.79999999999995, 174.0, 0.007834118631187974, 3.553286799938081, 0.058272207713386155], "isController": false}, {"data": ["2.0 Register attendance", 1694, 7, 0.4132231404958678, 987.6865407319951, 424, 2723, 940.5, 1461.5, 1611.0, 1986.2499999999989, 0.4743953909155243, 951.9918083897518, 15.592262141049456], "isController": true}, {"data": ["2.5 Select patient", 1690, 0, 0.0, 137.1751479289939, 72, 1312, 106.0, 211.9000000000001, 328.34999999999945, 670.2699999999998, 0.4764546809839889, 213.94426173153357, 3.4384598583935806], "isController": false}, {"data": ["7.1 Full name search", 27, 0, 0.0, 998.1481481481479, 276, 4977, 600.0, 2232.5999999999976, 4947.4, 4977.0, 0.007832477804353408, 3.6015799848282004, 0.05784696199580237], "isController": false}, {"data": ["2.3 Search by first/last name", 1698, 0, 0.0, 136.2691401648998, 80, 1000, 107.0, 203.10000000000014, 318.0999999999999, 637.02, 0.475146853397328, 215.1262037451499, 3.5554828546105193], "isController": false}, {"data": ["4.0 Vaccination for flu", 410, 0, 0.0, 942.6560975609757, 209, 3458, 845.5, 1303.7000000000005, 1565.6499999999999, 2552.1399999999985, 0.11703508454928505, 154.00005179159305, 3.3234278789488996], "isController": true}, {"data": ["4.0 Vaccination for hpv", 429, 0, 0.0, 946.0116550116554, 204, 3272, 870.0, 1297.0, 1467.5, 2015.7999999999975, 0.12243122732596501, 161.2173917049954, 3.486249375893263], "isController": true}, {"data": ["7.6 First name search", 27, 0, 0.0, 1981.740740740741, 325, 8915, 955.0, 5746.599999999998, 8598.999999999998, 8915.0, 0.007834959764579772, 4.33565612383357, 0.05780351518734405], "isController": false}, {"data": ["1.2 Sign-in page", 1741, 0, 0.0, 158.79839172889106, 16, 5934, 110.0, 252.79999999999995, 396.0, 815.539999999999, 0.48419348827895775, 216.0654630473945, 4.113002312069099], "isController": false}, {"data": ["2.4 Patient attending session", 720, 7, 0.9722222222222222, 492.2722222222223, 102, 1373, 443.0, 690.9, 824.5999999999995, 1078.37, 0.20237174058528717, 91.99730147077527, 1.7746871872197185], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 11.195591517857142, 21.065848214285715], "isController": false}, {"data": ["1.1 Homepage", 1742, 0, 0.0, 153.72273249138908, 27, 5801, 113.0, 209.70000000000005, 337.5499999999997, 709.9499999999978, 0.48389910453665136, 215.9022613871501, 4.10188835323329], "isController": false}, {"data": ["1.3 Sign-in", 1738, 0, 0.0, 173.56789413118528, 71, 5747, 117.0, 323.0, 417.14999999999986, 846.9299999999987, 0.48376883198218573, 216.14533680108556, 4.272258870168052], "isController": false}, {"data": ["Run some searches", 27, 0, 0.0, 8288.851851851852, 4126, 17289, 6646.0, 16672.6, 17208.2, 17289.0, 0.007777714083740631, 31.41181572409654, 0.46123211692885724], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 415, 0, 0.0, 955.8072289156629, 213, 2470, 875.0, 1303.8000000000002, 1471.1999999999998, 1920.9199999999996, 0.12005236018600883, 158.3978894447036, 3.4098805555856893], "isController": true}, {"data": ["2.1 Open session", 1706, 0, 0.0, 354.277256740914, 129, 1845, 306.0, 553.0, 691.6499999999999, 1004.3700000000006, 0.47629869567863625, 212.725559172854, 3.441024308909717], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1509.5185185185182, 346, 7479, 900.0, 3726.9999999999995, 6176.599999999993, 7479.0, 0.007841144226231531, 4.346728148709478, 0.057841484553671905], "isController": false}, {"data": ["4.3 Vaccination confirm", 1644, 0, 0.0, 627.5304136253055, 392, 2269, 547.0, 896.5, 1091.25, 1598.7999999999993, 0.4745677579704434, 211.8359573458232, 4.894867428096778], "isController": false}, {"data": ["4.1 Vaccination questions", 1670, 0, 0.0, 164.8017964071855, 84, 1286, 124.0, 274.8000000000002, 376.4499999999998, 674.29, 0.47618110735773944, 208.30543683031686, 4.467803879642801], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1357.5555555555554, 424, 4370, 918.0, 3040.3999999999996, 3931.5999999999976, 4370.0, 0.007837454673387138, 4.350901675121683, 0.05784488302018347], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 22.0, 22, 22, 22.0, 22.0, 22.0, 22.0, 45.45454545454545, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1738, 0, 0.0, 1127.6168009205965, 290, 17482, 1029.0, 1429.2000000000003, 1632.1999999999998, 2276.0499999999993, 0.4838943640227603, 888.2678170938468, 15.912703807090416], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 413, 0, 0.0, 930.6803874092012, 229, 2867, 869.0, 1274.4, 1446.9999999999986, 2075.4200000000005, 0.11856041815943706, 156.33039704543776, 3.370602557668304], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1286.2857142857144, 313, 5738, 599.0, 3456.400000000001, 4943.7499999999945, 5738.0, 0.007808904940526822, 4.2888405867834285, 0.05635664253691799], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2046.5185185185185, 1719, 4252, 1846.0, 2511.599999999999, 3911.999999999998, 4252.0, 0.007826434041857509, 4.345636560114115, 0.058406122793271696], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 129.25925925925924, 95, 263, 119.0, 199.0, 242.19999999999987, 263.0, 0.007836685790114978, 3.5546733957796257, 0.058429057150192115], "isController": false}, {"data": ["Debug Sampler", 1698, 0, 0.0, 0.2873969375736167, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.4751690586027847, 2.704558876153817, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1706, 0, 0.0, 653.4138335287222, 454, 2265, 607.0, 841.0, 962.0, 1270.5800000000004, 0.4762226444146565, 240.85552908037457, 3.436372196661389], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 286.1328125, 614.2578125], "isController": false}, {"data": ["4.2 Vaccination batch", 1668, 0, 0.0, 160.15947242206212, 85, 1424, 125.0, 261.0, 371.39999999999964, 638.31, 0.47609411021921166, 209.47447292753495, 4.223933731510323], "isController": false}, {"data": ["2.2 Session register", 1702, 0, 0.0, 150.79142185663932, 77, 1242, 106.0, 305.0, 402.6999999999998, 711.4000000000005, 0.4757744963065978, 219.0700756566534, 3.44141080887954], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 154.8888888888889, 91, 469, 117.0, 372.3999999999999, 461.4, 469.0, 0.0078310738751605, 3.552127865012879, 0.05814249456465465], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.03275466754012447], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21371, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 720, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
