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

    var data = {"OkPercent": 99.78396543446952, "KoPercent": 0.2160345655304849};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.672064193734384, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9642857142857143, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.01300578034682081, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9774709302325582, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9697841726618706, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0650887573964497, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.059880239520958084, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9425207756232687, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.3524962178517398, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9453665283540802, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9196927374301676, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.0759493670886076, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6779053084648493, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.27899686520376177, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9435975609756098, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3680167597765363, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.060126582278481014, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.03571428571428571, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.6988555078683834, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9601226993865031, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9483500717360115, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8332, 18, 0.2160345655304849, 528.7037926068184, 11, 8401, 228.0, 1334.0, 1749.0499999999984, 2861.380000000001, 4.185615888863157, 1714.2596640483753, 20.168680678248613], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 14, 0, 0.0, 212.14285714285714, 91, 1413, 99.5, 845.0, 1413.0, 1413.0, 0.008442095665828086, 3.412427446971579, 0.03704075470676984], "isController": false}, {"data": ["2.0 Register attendance", 692, 18, 2.601156069364162, 2633.358381502886, 835, 8489, 2468.0, 3660.300000000001, 4234.5, 5251.3900000000085, 0.3914357035745659, 791.8280780282458, 8.487181479448777], "isController": true}, {"data": ["2.5 Select patient", 688, 0, 0.0, 177.0188953488371, 82, 3241, 122.0, 259.60000000000014, 416.7499999999998, 1099.65, 0.39420202166048435, 160.33668625733972, 1.641819817446648], "isController": false}, {"data": ["2.3 Search by first/last name", 695, 0, 0.0, 190.5251798561151, 85, 2611, 125.0, 327.4, 552.7999999999997, 1175.8799999999956, 0.39344425630827007, 160.28078963572298, 1.7031451542881744], "isController": false}, {"data": ["4.0 Vaccination for flu", 169, 0, 0.0, 2063.579881656803, 467, 5071, 1940.0, 2840.0, 3436.5, 4740.600000000006, 0.09965492271731259, 118.15719199055253, 1.6743352631523858], "isController": true}, {"data": ["4.0 Vaccination for hpv", 167, 0, 0.0, 2215.760479041917, 284, 7893, 1945.0, 3416.4, 4288.399999999996, 5779.559999999979, 0.09968102073365231, 117.73371944433501, 1.6733124799668009], "isController": true}, {"data": ["1.2 Sign-in page", 722, 0, 0.0, 247.45983379501388, 21, 3061, 152.0, 459.70000000000005, 811.1000000000001, 1699.54, 0.4021034129780269, 162.18592186506228, 1.9692705293424106], "isController": false}, {"data": ["7.1 Name search", 14, 0, 0.0, 6387.428571428571, 5268, 8401, 6131.5, 8180.5, 8401.0, 8401.0, 0.008391001490002123, 3.3920494755174553, 0.036382858023056075], "isController": false}, {"data": ["2.4 Patient attending session", 661, 18, 2.723146747352496, 1426.9304084720122, 252, 7257, 1211.0, 2201.4000000000005, 2698.499999999998, 4095.5199999999995, 0.3767068639296054, 153.74327902292012, 1.9173072823463537], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 9.499289772727272, 17.87405303030303], "isController": false}, {"data": ["1.1 Homepage", 723, 0, 0.0, 250.02351313969578, 41, 2911, 161.0, 451.20000000000005, 728.399999999998, 1944.4399999999998, 0.40212576024294405, 162.123581757576, 1.9565251491981124], "isController": false}, {"data": ["1.3 Sign-in", 716, 0, 0.0, 305.7751396648047, 95, 2576, 175.5, 584.4000000000005, 992.7999999999997, 1832.260000000001, 0.3994530394415245, 161.36436520353277, 2.098275847219812], "isController": false}, {"data": ["Run some searches", 14, 0, 0.0, 10845.785714285714, 9038, 13748, 10686.0, 13147.0, 13748.0, 13748.0, 0.00828521987789953, 18.564662590338486, 0.18152005933105134], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 158, 0, 0.0, 2125.6518987341788, 340, 4941, 1922.0, 3010.5999999999995, 3489.7499999999995, 4742.759999999998, 0.09568398607374086, 114.31197361506514, 1.6167614167119349], "isController": true}, {"data": ["2.1 Open session", 697, 0, 0.0, 674.6929698708752, 282, 6174, 558.0, 1159.4000000000003, 1413.7000000000003, 2248.279999999999, 0.39199365611414494, 157.93843174065992, 1.6350135099320058], "isController": false}, {"data": ["4.3 Vaccination confirm", 638, 0, 0.0, 1650.064263322882, 1007, 7525, 1427.5, 2415.3, 3013.099999999999, 4332.22, 0.3846156164791515, 155.36779581850334, 2.3237945090469068], "isController": false}, {"data": ["4.1 Vaccination questions", 656, 0, 0.0, 269.0838414634145, 125, 2645, 176.0, 504.30000000000007, 752.4999999999998, 1620.0399999999986, 0.3840097407348869, 151.60567811506684, 2.1952256532848637], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 716, 0, 0.0, 1414.455307262572, 436, 6927, 1195.5, 2088.000000000001, 2640.2, 5197.13, 0.3991557521354275, 662.3672890310634, 7.613963588222062], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 158, 0, 0.0, 2102.898734177216, 274, 4552, 1949.0, 3000.2999999999997, 3284.199999999997, 4285.909999999998, 0.09346076333782694, 111.13237105224398, 1.575827539973701], "isController": true}, {"data": ["7.0 Open Children Search", 14, 0, 0.0, 1625.9285714285716, 785, 2698, 1593.5, 2229.0, 2698.0, 2698.0, 0.008327236606532121, 3.9601859343679924, 0.03466642075296063], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 14, 0, 0.0, 1764.2142857142856, 1548, 2094, 1677.0, 2085.5, 2094.0, 2094.0, 0.008450421977857479, 4.19727260650097, 0.03725883948091472], "isController": false}, {"data": ["7.2 No Consent search", 14, 0, 0.0, 2114.5714285714284, 1791, 4088, 1887.0, 3209.5, 4088.0, 4088.0, 0.00842151866449151, 4.474544488890514, 0.03707383261960963], "isController": false}, {"data": ["1.4 Open Sessions list", 699, 0, 0.0, 624.7682403433488, 424, 2448, 522.0, 897.0, 1170.0, 1783.0, 0.39161638401936233, 180.09258323073712, 1.629529486955925], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 26.012073863636367, 55.84161931818182], "isController": false}, {"data": ["4.2 Vaccination batch", 652, 0, 0.0, 242.84969325153364, 116, 1596, 172.0, 431.10000000000014, 596.5000000000002, 1180.47, 0.3832131482076851, 152.30210238623653, 1.9952036688618158], "isController": false}, {"data": ["2.2 Session register", 697, 0, 0.0, 229.7058823529411, 82, 2246, 130.0, 499.0, 662.4000000000003, 1432.6999999999994, 0.3923142431458987, 164.1486386481172, 1.639796560686004], "isController": false}, {"data": ["7.3 Due vaccination", 14, 0, 0.0, 367.42857142857144, 281, 724, 336.0, 590.5, 724.0, 724.0, 0.00844745951705874, 3.4145955997485067, 0.03694879666693417], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 100.0, 0.2160345655304849], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8332, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 661, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
