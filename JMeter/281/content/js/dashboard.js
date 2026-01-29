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

    var data = {"OkPercent": 99.96668887408394, "KoPercent": 0.033311125916055964};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7030393622321873, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9807692307692307, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.10903149138443256, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.958433014354067, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5576923076923077, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.961104513064133, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.24572127139364303, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.23907766990291263, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3076923076923077, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9347447795823666, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.444636678200692, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9562064965197216, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9346689895470384, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.21723300970873785, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4733570159857904, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.40384615384615385, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.3690842040565458, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9435336976320583, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.34615384615384615, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.34523809523809523, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.22397094430992737, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.5265800354400473, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9462332928311057, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9572700296735905, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9807692307692307, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21014, 7, 0.033311125916055964, 435.8776529932406, 0, 7765, 152.0, 1198.0, 1629.0, 2494.970000000005, 5.635618913731371, 2346.455609278634, 42.23160328048052], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 155.5, 91, 751, 106.0, 275.1000000000002, 647.3999999999996, 751.0, 0.0076910903155861425, 3.4810670916363833, 0.05652622060931184], "isController": false}, {"data": ["2.0 Register attendance", 1683, 7, 0.41592394533571003, 2058.6476530005903, 500, 6042, 1930.0, 3145.2000000000003, 3642.0, 4571.4000000000015, 0.471829692749999, 925.5915373893667, 14.972171555948123], "isController": true}, {"data": ["2.5 Select patient", 1672, 0, 0.0, 189.6399521531099, 66, 2125, 108.0, 360.4000000000001, 674.7999999999975, 1426.0499999999997, 0.46954843594314644, 210.38792532028006, 3.3472546120601776], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1081.423076923077, 314, 6584, 736.5, 1679.4, 4935.499999999993, 6584.0, 0.007688945484785055, 3.521401297191642, 0.05610123091884673], "isController": false}, {"data": ["2.3 Search by first/last name", 1684, 0, 0.0, 198.7719714964369, 75, 3234, 120.0, 354.0, 638.0, 1502.1000000000013, 0.47232243803642887, 213.22019420859488, 3.492876109267056], "isController": false}, {"data": ["4.0 Vaccination for flu", 409, 0, 0.0, 1792.0293398533008, 222, 7151, 1515.0, 2874.0, 3315.5, 4555.5, 0.1168090509021857, 153.7396013683188, 3.286816134682121], "isController": true}, {"data": ["4.0 Vaccination for hpv", 412, 0, 0.0, 1806.5533980582527, 196, 6209, 1538.0, 2907.1, 3525.1, 4757.7, 0.11759608484957121, 154.23428194398102, 3.303044365870248], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 1944.423076923077, 748, 7765, 1389.5, 4444.100000000002, 7395.749999999998, 7765.0, 0.007690699016507495, 4.249973174989728, 0.05605914125358986], "isController": false}, {"data": ["1.2 Sign-in page", 1724, 0, 0.0, 249.64269141531355, 16, 3364, 128.0, 555.0, 968.5, 1599.5, 0.4793714561547513, 213.63525290154936, 4.022474855590739], "isController": false}, {"data": ["2.4 Patient attending session", 578, 7, 1.2110726643598615, 936.9117647058824, 91, 3768, 724.5, 1733.1000000000004, 2297.3499999999995, 3232.8700000000017, 0.16370714547702364, 74.1487685918601, 1.4177687351569592], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1724, 0, 0.0, 210.64153132250578, 28, 3293, 124.0, 416.0, 705.75, 1473.75, 0.4794850486326888, 213.47251764885314, 4.0147839238800795], "isController": false}, {"data": ["1.3 Sign-in", 1722, 0, 0.0, 260.8670150987227, 72, 3330, 132.0, 561.7, 905.5499999999997, 1825.31, 0.479625925201752, 213.9657599017547, 4.185486972895426], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 8489.230769230768, 5504, 19728, 7580.0, 14639.200000000003, 18771.099999999995, 19728.0, 0.007658048122585322, 30.835263078620763, 0.44868326765820715], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 412, 0, 0.0, 1808.4878640776706, 234, 4996, 1584.5, 2875.9, 3239.699999999997, 4335.93, 0.1189748411527045, 156.87766555217394, 3.3454378585488764], "isController": true}, {"data": ["2.1 Open session", 1689, 0, 0.0, 1133.9656601539352, 132, 5749, 1164.0, 1968.0, 2216.0, 3088.7999999999984, 0.4713776899088335, 210.1829306483655, 3.363735688426324], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 1234.8461538461538, 448, 3736, 889.0, 2755.000000000001, 3711.15, 3736.0, 0.007700007700007701, 4.249575365861424, 0.05611947468918623], "isController": false}, {"data": ["4.3 Vaccination confirm", 1627, 0, 0.0, 1350.5507068223737, 741, 6755, 1103.0, 2197.000000000001, 2749.999999999998, 3796.720000000002, 0.47046413441105384, 209.5642849719565, 4.794541174304649], "isController": false}, {"data": ["4.1 Vaccination questions", 1647, 0, 0.0, 245.02125075895577, 80, 2948, 135.0, 505.0000000000002, 842.3999999999996, 1595.6799999999998, 0.4686575649782189, 204.42323048467713, 4.347619726161848], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 1602.0769230769229, 855, 5248, 1155.5, 3535.9, 4737.699999999998, 5248.0, 0.007693145289191248, 4.254183360422082, 0.05607812847670989], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 39.0, 39, 39, 39.0, 39.0, 39.0, 39.0, 25.64102564102564, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1722, 0, 0.0, 1424.1655052264814, 524, 9987, 1226.0, 2268.0, 2635.3999999999996, 3470.24, 0.47972493541682165, 879.4443169188427, 15.5901207177167], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 413, 0, 0.0, 1844.8740920096848, 218, 7422, 1588.0, 2931.8, 3460.799999999999, 5152.080000000004, 0.11899558506210677, 156.5751346034011, 3.346282908275869], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 996.0, 419, 3298, 731.0, 1981.3999999999999, 2843.9999999999977, 3298.0, 0.007702558019518282, 4.210968243369595, 0.054903570570693935], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 2188.461538461539, 1801, 4711, 2022.5, 2609.7000000000003, 4034.099999999997, 4711.0, 0.007683669247591465, 4.2507273858162415, 0.0566592685183817], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 124.46153846153848, 89, 382, 108.5, 158.3, 308.8499999999997, 382.0, 0.007690594373501998, 3.4808426231153238, 0.0566577618765701], "isController": false}, {"data": ["Debug Sampler", 1684, 0, 0.0, 0.3010688836104512, 0, 16, 0.0, 1.0, 1.0, 1.0, 0.47237053148416913, 2.6485811558484746, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1693, 0, 0.0, 715.4607206142958, 441, 2521, 642.0, 960.6000000000001, 1207.1999999999998, 1861.1799999999998, 0.47219014787667835, 238.3347492784144, 3.365649925165671], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1646, 0, 0.0, 232.98663426488437, 77, 3108, 129.0, 494.29999999999995, 794.0, 1503.7699999999998, 0.46934889389350287, 206.06129707514515, 4.1144783494288255], "isController": false}, {"data": ["2.2 Session register", 1685, 0, 0.0, 216.18753709198808, 73, 3196, 121.0, 431.8000000000002, 653.0999999999995, 1606.7599999999957, 0.47120543298465994, 215.85230806549546, 3.366642712412977], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 158.03846153846152, 86, 856, 106.0, 342.70000000000005, 693.2499999999993, 856.0, 0.007690846886478958, 3.4809569131026, 0.05641928321233068], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.033311125916055964], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21014, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 578, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
