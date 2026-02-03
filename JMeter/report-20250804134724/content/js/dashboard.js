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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3696769456681351, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.4, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.48333333333333334, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.35344827586206895, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4074074074074074, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.375, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.14285714285714285, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.5, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7285714285714285, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.3046875, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.051587301587301584, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.375, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.45075757575757575, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.45, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.45, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.48717948717948717, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [1.0, 500, 1500, "Select Teams"], "isController": true}, {"data": [0.4418604651162791, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.4166666666666667, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.3783783783783784, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.4734848484848485, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.28225806451612906, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.44285714285714284, 500, 1500, "1.4 Select Team"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1131, 0, 0.0, 1174.9204244031819, 0, 6257, 1003.0, 2076.6000000000004, 2489.5999999999967, 4149.080000000002, 1.8795305660527863, 43.17859021133917, 2.361302438030332], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 1, 0, 0.0, 12325.0, 12325, 12325, 12325.0, 12325.0, 12325.0, 12325.0, 0.08113590263691683, 19.07026495943205, 1.2677484787018256], "isController": true}, {"data": ["2.0 Register attendance", 51, 0, 0.0, 7958.549019607841, 4838, 12622, 7715.0, 11062.4, 11259.8, 12622.0, 0.09892367165875601, 20.493598283698542, 0.4058211792186582], "isController": true}, {"data": ["2.5 Select patient", 45, 0, 0.0, 1301.8666666666666, 647, 6037, 989.0, 2504.4, 3526.4999999999977, 6037.0, 0.09066840750009067, 2.448723867350105, 0.06286579035650817], "isController": false}, {"data": ["2.5 Select menacwy", 30, 0, 0.0, 957.5333333333333, 671, 1549, 939.5, 1413.0000000000005, 1513.25, 1549.0, 0.11271966244218422, 2.7293202276373583, 0.0785955458825386], "isController": false}, {"data": ["2.3 Search by first/last name", 58, 0, 0.0, 1303.827586206896, 713, 4557, 1084.0, 1904.8000000000002, 2292.4999999999977, 4557.0, 0.1094488307845594, 3.5229118831945097, 0.08548478519723435], "isController": false}, {"data": ["2.5 Select td_ipv", 27, 0, 0.0, 1044.814814814815, 711, 1732, 916.0, 1601.3999999999999, 1691.5999999999997, 1732.0, 0.16420061666453814, 4.196653709261523, 0.11433109343927314], "isController": false}, {"data": ["4.0 Vaccination for flu", 40, 0, 0.0, 3764.7999999999993, 2715, 5355, 3696.0, 4499.4, 4739.5999999999985, 5355.0, 0.09574417157355546, 5.185133604259419, 0.5643670113456843], "isController": true}, {"data": ["5.8 Consent confirm", 8, 0, 0.0, 2640.25, 1713, 4072, 2227.0, 4072.0, 4072.0, 4072.0, 0.028034173657688722, 2.8919515584810385, 0.06145821834941794], "isController": false}, {"data": ["4.0 Vaccination for hpv", 39, 0, 0.0, 3647.7948717948716, 1573, 5676, 3650.0, 4140.0, 4687.0, 5676.0, 0.12040716144747933, 6.308658693165504, 0.715978802164859], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 90.45714285714283, 85, 106, 89.0, 95.8, 99.59999999999997, 106.0, 0.5958562454246752, 3.5413878023970446, 0.35902666350295376], "isController": false}, {"data": ["5.9 Patient home page", 8, 0, 0.0, 1097.625, 728, 2328, 849.0, 2328.0, 2328.0, 2328.0, 0.028211132112731685, 0.7329556549655118, 0.021034374382881485], "isController": false}, {"data": ["2.4 Patient attending session", 49, 0, 0.0, 2165.6734693877547, 1090, 5008, 1872.0, 3486.0, 4480.5, 5008.0, 0.0959031730249818, 3.1990768677387598, 0.14254358334377176], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 106.0, 106, 106, 106.0, 106.0, 106.0, 106.0, 9.433962264150942, 44.65470224056604, 6.89121462264151], "isController": false}, {"data": ["5.4 Consent route", 8, 0, 0.0, 968.2500000000001, 775, 1146, 994.0, 1146.0, 1146.0, 1146.0, 0.028302354048297968, 0.3552684776782872, 0.0445782805523912], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 272.31428571428575, 247, 350, 265.0, 312.0, 339.59999999999997, 350.0, 0.5979124314536105, 3.311290428489673, 0.32406386665698617], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 538.1714285714285, 401, 890, 514.0, 703.4, 812.3999999999996, 890.0, 0.5235523776757266, 5.534112242150454, 0.8195844349747947], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 26, 0, 0.0, 3895.8846153846143, 1801, 5001, 3948.5, 4747.9, 4915.599999999999, 5001.0, 0.22465696609407942, 12.411436686698579, 1.3037006429725573], "isController": true}, {"data": ["2.1 Open session", 64, 0, 0.0, 1589.2187500000007, 883, 4683, 1405.5, 2301.0, 3189.75, 4683.0, 0.1164724851952552, 2.0619376278467514, 0.07347953644405864], "isController": false}, {"data": ["4.3 Vaccination confirm", 126, 0, 0.0, 2027.8095238095239, 1374, 5527, 1819.5, 2807.4999999999995, 3427.849999999999, 5363.380000000003, 0.3207233074209264, 6.8499969852645455, 0.7464279163230345], "isController": false}, {"data": ["5.6 Consent questions", 8, 0, 0.0, 1237.75, 943, 2240, 1031.0, 2240.0, 2240.0, 2240.0, 0.028425140615617486, 0.35836079986569125, 0.07058747992474444], "isController": false}, {"data": ["4.1 Vaccination questions", 132, 0, 0.0, 1061.1590909090905, 745, 2272, 979.5, 1495.7000000000003, 1784.6499999999992, 2233.3899999999985, 0.31568751718942445, 3.7796321388427185, 0.662769089229555], "isController": false}, {"data": ["5.3 Consent parent details", 10, 0, 0.0, 980.6999999999999, 768, 1822, 907.0, 1745.8000000000002, 1822.0, 1822.0, 0.023494639697952912, 0.2738892211585677, 0.04315992845294846], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["5.2 Consent who", 10, 0, 0.0, 1021.6999999999999, 805, 1504, 950.0, 1477.9, 1504.0, 1504.0, 0.02340369263462389, 0.492844284408694, 0.037036800697664074], "isController": false}, {"data": ["1.0 Login", 35, 0, 0.0, 3142.2000000000003, 2167, 4738, 2949.0, 4276.2, 4711.599999999999, 4738.0, 0.5652637359087825, 33.67790553130754, 2.689970883870603], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 27, 0, 0.0, 4981.000000000002, 3286, 8012, 4859.0, 6426.599999999999, 7681.199999999998, 8012.0, 0.167331862465604, 9.153842086752276, 1.0162348219929844], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 39, 0, 0.0, 892.9743589743589, 665, 1550, 907.0, 1087.0, 1125.0, 1550.0, 0.12130222605136372, 2.8703455130617614, 0.09038437351288135], "isController": false}, {"data": ["Select Teams", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select flu", 43, 0, 0.0, 1237.3488372093027, 684, 6257, 896.0, 1616.4000000000003, 3891.7999999999997, 6257.0, 0.08754463758555961, 2.0236565683672723, 0.06069989520092512], "isController": false}, {"data": ["5.1 Consent start", 12, 0, 0.0, 1383.3333333333333, 940, 2504, 1212.0, 2385.5000000000005, 2504.0, 2504.0, 0.02650697685720029, 0.34280889877869103, 0.05719449742771879], "isController": false}, {"data": ["5.5 Consent agree", 8, 0, 0.0, 971.6250000000001, 765, 1376, 839.0, 1376.0, 1376.0, 1376.0, 0.02829524675223621, 0.4835855239307049, 0.04404207657931688], "isController": false}, {"data": ["Debug Sampler", 66, 0, 0.0, 0.2575757575757575, 0, 2, 0.0, 1.0, 1.0, 2.0, 0.11937685282823661, 0.37588058798978424, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 37, 0, 0.0, 1199.9189189189187, 641, 2428, 1086.0, 1907.0000000000007, 2203.0000000000005, 2428.0, 0.34751573213111675, 7.934150685052128, 0.20866720085470086], "isController": false}, {"data": ["4.2 Vaccination batch", 132, 0, 0.0, 1008.022727272727, 729, 2220, 917.5, 1298.1000000000001, 1517.0, 2183.0399999999986, 0.31608665563556165, 6.828318756480375, 0.5080682353564475], "isController": false}, {"data": ["5.0 Consent for hpv", 3, 0, 0.0, 12222.333333333334, 11280, 12761, 12626.0, 12761.0, 12761.0, 12761.0, 0.0794891497310617, 18.456102324064016, 1.2741551793805146], "isController": true}, {"data": ["5.7 Consent triage", 8, 0, 0.0, 1101.5, 783, 1388, 1119.0, 1388.0, 1388.0, 1388.0, 0.028296447734692507, 0.47430746102164323, 0.04726321952561005], "isController": false}, {"data": ["5.0 Consent for flu", 4, 0, 0.0, 10298.5, 8821, 11550, 10411.5, 11550.0, 11550.0, 11550.0, 0.013700131521262605, 3.2122761259367465, 0.21403779695035072], "isController": true}, {"data": ["2.2 Session register", 62, 0, 0.0, 1593.8225806451615, 718, 5053, 1413.0, 2414.1000000000004, 3372.3999999999974, 5053.0, 0.11468865729179384, 9.888034475734099, 0.07325745210361194], "isController": false}, {"data": ["1.4 Select Team", 35, 0, 0.0, 1073.342857142857, 713, 2714, 920.0, 1621.7999999999997, 2672.3999999999996, 2714.0, 0.5156613725432418, 7.578308589260984, 0.7483132808586499], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1131, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
