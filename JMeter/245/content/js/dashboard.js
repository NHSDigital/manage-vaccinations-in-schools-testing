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

    var data = {"OkPercent": 99.92323046215262, "KoPercent": 0.07676953784738216};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8076309328968904, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.34255842558425587, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9910438542310068, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5576923076923077, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9957002457002457, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4715346534653465, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.46296296296296297, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3269230769230769, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9759326113116726, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4820801124385102, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9804921968787516, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9747140276941602, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.45, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9285714285714286, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5192307692307693, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.5669216061185468, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.992462311557789, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.3269230769230769, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.5141481035520771, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.45758354755784064, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5925925925925926, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.9329044117647058, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9902392947103275, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9920196439533456, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9230769230769231, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19539, 15, 0.07676953784738216, 284.44111776447187, 2, 28964, 131.0, 678.0, 899.0, 1645.5999999999913, 5.0364555972732665, 2177.511148394248, 24.344080010730725], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 26, 0, 0.0, 133.50000000000003, 86, 491, 109.0, 200.9, 395.0999999999996, 491.0, 0.007702263665667248, 3.291070455605189, 0.033742244690696345], "isController": false}, {"data": ["2.0 Register attendance", 1626, 15, 0.922509225092251, 1399.3191881918824, 358, 5063, 1303.5, 2058.5, 2399.2999999999997, 3192.960000000001, 0.45482733764048666, 976.6124537996054, 9.672466230958301], "isController": true}, {"data": ["2.5 Select patient", 1619, 0, 0.0, 114.32118591723291, 55, 2287, 89.0, 172.0, 263.0, 574.7999999999997, 0.45578954065760946, 192.16215051179196, 1.8960303394942342], "isController": false}, {"data": ["7.1 Full name search", 26, 0, 0.0, 1173.1153846153848, 353, 5251, 703.0, 4629.8, 5123.249999999999, 5251.0, 0.007638149147200648, 3.280019312399125, 0.0330539871542489], "isController": false}, {"data": ["2.3 Search by first/last name", 1628, 0, 0.0, 108.72972972972967, 57, 1454, 87.0, 160.0, 253.0, 481.5500000000002, 0.45552222769396067, 193.8870939726197, 1.96950177868419], "isController": false}, {"data": ["4.0 Vaccination for flu", 404, 0, 0.0, 997.5396039603959, 183, 3308, 903.0, 1385.5, 1609.0, 2504.749999999999, 0.11556064073226545, 142.81879123015588, 1.9496908296982265], "isController": true}, {"data": ["4.0 Vaccination for hpv", 405, 0, 0.0, 1002.0765432098765, 190, 2910, 909.0, 1470.0000000000002, 1727.6, 2093.14, 0.1156737007701298, 142.60780682922177, 1.9526896058861347], "isController": true}, {"data": ["7.6 First name search", 26, 0, 0.0, 1629.7692307692307, 565, 5230, 1170.0, 3383.3, 4603.499999999997, 5230.0, 0.007702117637997508, 3.9786856044644137, 0.033294648398329824], "isController": false}, {"data": ["1.2 Sign-in page", 1662, 0, 0.0, 156.36101083032491, 11, 3043, 104.0, 280.70000000000005, 462.6999999999998, 883.6999999999989, 0.46263447228076293, 193.801395602683, 2.3007478239547785], "isController": false}, {"data": ["2.4 Patient attending session", 1423, 14, 0.9838369641602249, 840.342937456079, 159, 3739, 717.0, 1291.8000000000004, 1535.0, 2348.3599999999997, 0.39987489507850393, 204.75179745679708, 2.0369703203186185], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 1666, 0, 0.0, 158.33013205282143, 24, 3520, 110.0, 260.29999999999995, 409.8999999999992, 900.3199999999997, 0.46282521736255744, 193.68148294010902, 2.293255620767101], "isController": false}, {"data": ["1.3 Sign-in", 1661, 0, 0.0, 171.59301625526786, 60, 2884, 110.0, 310.0, 490.0, 978.5599999999986, 0.4625498891105564, 193.96157472660894, 2.413211838363598], "isController": false}, {"data": ["Run some searches", 26, 0, 0.0, 11298.26923076923, 6358, 43699, 9101.0, 18326.5, 35270.649999999965, 43699.0, 0.007647097059014707, 30.495375362906223, 0.26646962278929043], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 390, 0, 0.0, 1053.607692307693, 189, 4043, 925.0, 1599.8000000000002, 1875.9499999999998, 2867.949999999986, 0.1130670420879018, 140.11862069044244, 1.9089629997345825], "isController": true}, {"data": ["2.1 Open session", 1631, 1, 0.061312078479460456, 317.0496627835682, 98, 3736, 244.0, 567.0, 757.3999999999999, 1265.6400000000046, 0.45536641361397606, 191.23271009926833, 1.8973602384922261], "isController": false}, {"data": ["7.7 Partial name search", 26, 0, 0.0, 999.6153846153846, 230, 3188, 704.5, 2606.9, 3066.1999999999994, 3188.0, 0.007710804497890205, 3.977990254618179, 0.03332466979962585], "isController": false}, {"data": ["4.3 Vaccination confirm", 1569, 0, 0.0, 739.6653919694079, 422, 3798, 629.0, 1130.0, 1400.0, 2123.3999999999955, 0.4531515258989527, 189.7871748221727, 2.7346436773917824], "isController": false}, {"data": ["4.1 Vaccination questions", 1592, 0, 0.0, 144.58731155778935, 75, 1944, 110.0, 226.70000000000005, 329.3499999999999, 556.9099999999992, 0.45419324210668066, 186.1174360919867, 2.595269236899007], "isController": false}, {"data": ["7.7 Last name search", 26, 0, 0.0, 1944.8846153846155, 689, 7419, 1151.0, 4927.000000000002, 7024.549999999998, 7419.0, 0.007695684230684647, 3.976837611461627, 0.0332619242592238], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1661, 0, 0.0, 810.1059602649024, 273, 9447, 685.0, 1214.6, 1453.0, 2261.839999999998, 0.4626427793327638, 798.743714910105, 8.897218044763962], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 389, 0, 0.0, 1016.9254498714654, 210, 3969, 923.0, 1480.0, 1755.5, 2837.500000000003, 0.1123180245886966, 138.8424992235728, 1.8965421897286754], "isController": true}, {"data": ["7.0 Open Children Search", 27, 0, 0.0, 873.5555555555555, 223, 2733, 594.0, 2038.9999999999998, 2564.199999999999, 2733.0, 0.007640303563409285, 3.9045090454119835, 0.031777671729263865], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 26, 0, 0.0, 1751.3846153846155, 1552, 2673, 1675.0, 1971.8, 2446.199999999999, 2673.0, 0.007703251779599301, 3.982265216366566, 0.03393464111216587], "isController": false}, {"data": ["7.2 No Consent search", 26, 0, 0.0, 3217.9230769230758, 1961, 28964, 2145.5, 2648.9, 19783.849999999962, 28964.0, 0.007637843989398673, 4.2180294653516555, 0.03359429254396608], "isController": false}, {"data": ["1.4 Open Sessions list", 1632, 0, 0.0, 329.8069852941179, 180, 1985, 271.5, 565.1000000000001, 691.6999999999998, 1083.3400000000001, 0.4551632158954597, 217.62046764673644, 1.8929841284489002], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1588, 0, 0.0, 141.84508816120916, 65, 1723, 101.0, 245.20000000000027, 362.54999999999995, 636.1099999999999, 0.4549703939762837, 187.63895506365145, 2.3675627301532773], "isController": false}, {"data": ["2.2 Session register", 1629, 0, 0.0, 124.23143032535293, 56, 1681, 87.0, 230.0, 332.5, 592.2000000000007, 0.45561705344704084, 197.60310063146244, 1.9026393628975846], "isController": false}, {"data": ["7.3 Due vaccination", 26, 0, 0.0, 448.0769230769231, 329, 1557, 398.5, 520.7, 1201.3999999999985, 1557.0, 0.007702975629858985, 3.9491710010409387, 0.03364004955901946], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, 93.33333333333333, 0.07165156865755667], "isController": false}, {"data": ["Assertion failed", 1, 6.666666666666667, 0.005117969189825477], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19539, 15, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1423, 14, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 1631, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
